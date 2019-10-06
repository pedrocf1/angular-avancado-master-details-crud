import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators  } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { Entry } from "../shared/entry.model"
import { EntryService } from '../shared/entry.service';

import { switchMap } from "rxjs/operators";

import toastr from "toastr";
import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  entryForm: FormGroup;
  pageTitle: string;
  serveErrorMessages: string[] = null;
  submittingForm: boolean = false;
  entry: Entry = new Entry();
  categories: Array<Category>;

  imaskConfig={
    mask: Number,
    scale: 2,
    thousandsSeparator:'',
    padFractionalZeros: true,
    normalizeZeros: true,
    raidx: ','
  }

  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  }

  constructor(
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    this.setCurrentAction()//seing what action 
    this.buildEntryForm()// build form
    this.loadEntry()//build the entry or get in server
    this.loadCategories()
  }

  ngAfterContentChecked(): void {
    //carrega o titulo depois que tudo foi carregado
    this.setPageTitle()
  }


  submitForm(){
    this.submittingForm = true
    if (this.currentAction == 'new')
      this.createEntry()
    else
      this.updateEntry()
    
  }

  get typeOptions(): Array<any>{
    return Object.entries(Entry.types).map(
      //chave, valor
      ([value, text])=>{
        return{
          text,
          value
        }
      }
    )
  }

  //PRIVATES METHODS
  private setCurrentAction() {
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"

      console.log(this.currentAction)
  }

  private buildEntryForm() {
    this.entryForm = this.formBuilder.group({
      id: [null],
      name:[null,[Validators.required, Validators.minLength(2)]],
      description:[null],
      type:['expense', [Validators.required]],
      amount:[null, [Validators.required]],
      date:[null, [Validators.required]],
      paid:[true, [Validators.required]],
      categoryId:[null, [Validators.required]]
    })
  }

  private loadEntry() {
    if (this.currentAction == "edit") {
      this.route.paramMap.pipe(
        switchMap(params=> this.entryService.getById(+params.get("id")))
      )
      .subscribe((entry)=> {
        this.entry = entry
          this.entryForm.patchValue(entry)// bind loaded entry to entryForm
          console.log(this.entryForm)
        },
        (error)=>alert("Ocorreu um erro, tente mais tarde"))
    }
  }

  private setPageTitle(){
    if (this.currentAction == "new")
      this.pageTitle = 'Cadastro de Nova Lançamento'
    else{
      const entryName = this.entry.name || ''
      this.pageTitle = 'Editando Lançamento '+entryName
    }
  }

  private createEntry(){
    console.log('createEntry')
    //com isso eu crio um objeto novo e atribuo os valores do form
    const entry: Entry = Entry.fromJson(this.entryForm.value)
    this.entryService.create(entry)
    .subscribe(
      entry => this.actionsForSuccess(entry),
      error => this.actionsForError(error)
    )
  }
  
  private updateEntry(){
    const entry: Entry = Entry.fromJson(this.entryForm.value)
    this.entryService.update(entry)
     .subscribe(
       entry=> this.actionsForSuccess(entry),
       error=> this.actionsForError(error)
     )
  }

  private actionsForSuccess(entry: Entry){
    toastr.success('Solicitação processada com sucesso!')

    // skipLocationChange faz com que não va para o historico do navegador
    //estou redirecionando/recarregando o component para após a criação eu já mande o usuario para edição
    this.router.navigateByUrl('entries',{skipLocationChange: true})
     .then(()=>this.router.navigate(['entries',entry.id,'edit']))
    
  }

  private actionsForError(error){
    toastr.error('ocorreu um erro ao processar a sua solicitação')
    this.submittingForm = false;
    
    if(error.status === 422)
      this.serveErrorMessages = JSON.parse(error._body).errors //retorna um array de erros para tratar como quiser
    else  
      this.serveErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde"]
  }

  private loadCategories(){
    this.categoryService.getAll().subscribe(categories => this.categories = categories)
  }
}
