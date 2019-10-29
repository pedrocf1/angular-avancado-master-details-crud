import { Component, OnInit, Input } from '@angular/core';
import { FormControl } from '@angular/forms'

@Component({
  selector: 'app-form-fiel-error',
  templateUrl: './form-fiel-error.component.html',
  styleUrls: ['./form-fiel-error.component.css']
})
export class FormFielErrorComponent implements OnInit {

  @Input('form-control') FormControl: FormControl

  constructor() { }

  ngOnInit() {
  }


  public get errorMessage():string | null{
    if(this.mustShowErrorMessage()){
      return this.getErrorMessage()
    }else{
      return null
    }
  }

  private mustShowErrorMessage():boolean{
    return this.FormControl.invalid && this.FormControl.touched   
  }

  private getErrorMessage():string | null{
    if(this.FormControl.errors.required)
      return "Por favor preencha o campo!"
    
    if(this.FormControl.errors.email)
      return "Formato de email invalido"

    else if(this.FormControl.errors.minlength){
      const requiredLength = this.FormControl.errors.minlength.requiredLength
      return`Deve ter no minimo ${requiredLength} caracteres`
    }
    
    else if(this.FormControl.errors.maxlength){
      const requiredLength = this.FormControl.errors.maxlength.requiredLength
      return`Deve ter no máximo ${requiredLength} caracteres`
    }
  }

}
