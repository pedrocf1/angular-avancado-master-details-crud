import { Component, OnInit } from '@angular/core';

import { Entry } from "../shared/entry.model";
import { EntryService } from "../shared/entry.service";
import { BaseResourceListComponent } from 'src/app/shared/base-resource-list/base-resource-list.component';

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent extends BaseResourceListComponent<Entry> {

  resources:Entry[] = []

  constructor(private entryService: EntryService) {
    super(entryService)
   }
}
