import { Component, OnInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators  } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { Category } from "../shared/category.model"
import { CategoryService } from '../shared/category.service';

import { switchMap } from "rxjs/operators";

import toastr from "toastr";

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  currentAction: string;
  categoryForm: FormGroup;
  pageTitle: string;
  serveErrorMessages: string[] = null;
  submittingForm: boolean = false;
  category: Category = new Category();

  constructor(
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    this.setCurrentAction()//seing what action 
    this.buildCategoryForm()// build form
    this.loadCategory()//build the category or get in server
  }

  ngAfterContentChecked(): void {
    //carrega o titulo depois que tudo foi carregado
    this.setPageTitle()
  }


  submitForm(){
    this.submittingForm = true
    if (this.currentAction == 'new')
      this.createCategory()
    else
      this.updateCategory()
    
  }

  //PRIVATES METHODS
  private setCurrentAction() {
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"

      console.log(this.currentAction)
  }

  private buildCategoryForm() {
    this.categoryForm = this.formBuilder.group({
      id: [null],
      name:[null,[Validators.required, Validators.minLength(2)]],
      description:[null]
    })
  }

  private loadCategory() {
    if (this.currentAction == "edit") {
      this.route.paramMap.pipe(
        switchMap(params=> this.categoryService.getById(+params.get("id")))
      )
      .subscribe((category)=> {
        this.category = category
          this.categoryForm.patchValue(category)// bind loaded category to categoryForm
          console.log(this.categoryForm)
        },
        (error)=>alert("Ocorreu um erro, tente mais tarde"))
    }
  }

  private setPageTitle(){
    if (this.currentAction == "new")
      this.pageTitle = 'Cadastro de Nova Categoria'
    else{
      const categoryName = this.category.name || ''
      this.pageTitle = 'Editando Categoria '+categoryName
    }
  }

  private createCategory(){
    console.log('createCategory')
    //com isso eu crio um objeto novo e atribuo os valores do form
    const category: Category = Object.assign(new Category(), this.categoryForm.value)
    this.categoryService.create(category)
    .subscribe(
      category => {this.actionsForSuccess(category); console.log('criei a categoria',this.categoryForm)},
      error => this.actionsForError(error)
    )
  }
  
  private updateCategory(){
    const category: Category = Object.assign(new Category(), this.categoryForm.value)
    this.categoryService.update(category)
     .subscribe(
       category=> this.actionsForSuccess(category),
       error=> this.actionsForError(error)
     )
  }

  private actionsForSuccess(category: Category){
    toastr.success('Solicitação processada com sucesso!')

    // skipLocationChange faz com que não va para o historico do navegador
    //estou redirecionando/recarregando o component para após a criação eu já mande o usuario para edição
    this.router.navigateByUrl('categories',{skipLocationChange: true})
     .then(()=>this.router.navigate(['categories',category.id,'edit']))
    
  }

  private actionsForError(error){
    console.log('cai no erro')
    toastr.error('ocorreu um erro ao processar a sua solicitação')
    this.submittingForm = false;
    
    if(error.status === 422)
      this.serveErrorMessages = JSON.parse(error._body).errors //retorna um array de erros para tratar como quiser
    else  
      this.serveErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde"]
  }
}
