import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup  } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { switchMap } from "rxjs/operators";

import toastr from "toastr";
import { BaseResourceService } from '../services/base-resource.service';
import { BaseResourceModel } from '../models/base-resource.model';

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  currentAction: string;
  resourceForm: FormGroup;
  pageTitle: string;
  serveErrorMessages: string[] = null;
  submittingForm: boolean = false;


  protected route: ActivatedRoute
  protected router: Router
  protected formBuilder: FormBuilder

  constructor(
        protected injector:Injector,
        public resource: T,
        protected resourceService: BaseResourceService<T>,
        protected jsonDataToResourceFn: (jsonData:any)=>T
    ) {
        this.route = injector.get(ActivatedRoute)
        this.router = injector.get(Router)
        this.formBuilder = injector.get(FormBuilder)
   }

  ngOnInit() {
    this.setCurrentAction()//seing what action 
    this.buildResourceForm()// build form
    this.loadResource()//build the resource or get in server
  }

  ngAfterContentChecked(): void {
    //carrega o titulo depois que tudo foi carregado
    this.setPageTitle()
  }


  submitForm(){
    this.submittingForm = true
    if (this.currentAction == 'new')
      this.createResource()
    else
      this.updateResource()
    
  }

  //PRIVATES METHODS
  protected setCurrentAction() {
    if(this.route.snapshot.url[0].path == "new")
      this.currentAction = "new"
    else
      this.currentAction = "edit"

  }

  protected loadResource() {
    if (this.currentAction == "edit") {
      this.route.paramMap.pipe(
        switchMap(params=> this.resourceService.getById(+params.get("id")))
      )
      .subscribe((resource)=> {
        this.resource = resource
          this.resourceForm.patchValue(resource)// bind loaded resource to resourceForm
          console.log(this.resourceForm)
        },
        (error)=>alert("Ocorreu um erro, tente mais tarde"))
    }
  }

  protected setPageTitle(){
    if (this.currentAction == "new")
      this.pageTitle = this.creationPageTitle()
    else{
      const resourceName = ''//this.resource.name || 
      this.pageTitle = this.editionPageTitle()+resourceName
    }
  }

  protected creationPageTitle():string {
    return 'Novo'
  }

  protected editionPageTitle():string {
    return 'Novo'
  }

  protected createResource(){
    //com isso eu crio um objeto novo e atribuo os valores do form
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value)
    this.resourceService.create(resource)
    .subscribe(
      resource => this.actionsForSuccess(resource),
      error => this.actionsForError(error)
    )
  }
  
  protected updateResource(){
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value)
    this.resourceService.update(resource)
     .subscribe(
       resource=> this.actionsForSuccess(resource),
       error=> this.actionsForError(error)
     )
  }

  protected actionsForSuccess(resource: T){
    toastr.success('Solicitação processada com sucesso!')
    const baseResourcePath: string = this.route.snapshot.parent.url[0].path
    // skipLocationChange faz com que não va para o historico do navegador
    //estou redirecionando/recarregando o component para após a criação eu já mande o usuario para edição
    this.router.navigateByUrl(baseResourcePath,{skipLocationChange: true})
     .then(()=>this.router.navigate([baseResourcePath,resource.id,'edit']))
    
  }

  protected actionsForError(error){
    toastr.error('ocorreu um erro ao processar a sua solicitação')
    this.submittingForm = false;
    
    if(error.status === 422)
      this.serveErrorMessages = JSON.parse(error._body).errors //retorna um array de erros para tratar como quiser
    else  
      this.serveErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde"]
  }

  protected abstract buildResourceForm():void
}
