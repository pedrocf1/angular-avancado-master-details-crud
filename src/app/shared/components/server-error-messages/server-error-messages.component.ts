import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-server-error-messages',
  templateUrl: './server-error-messages.component.html',
  styleUrls: ['./server-error-messages.component.css']
})
export class ServerErrorMessagesComponent implements OnInit {

  @Input('server-error-messages') serveErrorMessages: string[] = null;

  constructor() { }

  ngOnInit() {
    console.log('component iniciado')
  }

}
