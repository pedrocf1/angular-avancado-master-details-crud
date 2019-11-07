import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { BreadCrumbComponent } from './components/bread-crumb/bread-crumb.component';
import { RouterModule } from '@angular/router';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { FormFielErrorComponent } from './components/form-fiel-error/form-fiel-error.component';
import { ServerErrorMessagesComponent } from './components/server-error-messages/server-error-messages.component';



@NgModule({
  declarations: [BreadCrumbComponent, PageHeaderComponent, FormFielErrorComponent, ServerErrorMessagesComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports:[
    //modules
    CommonModule,
    ReactiveFormsModule,
    RouterModule,

    //components 
    BreadCrumbComponent,
    PageHeaderComponent,
    FormFielErrorComponent,
    ServerErrorMessagesComponent
  ]
})
export class SharedModule { }
