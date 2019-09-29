import { Component, OnInit } from '@angular/core';

import { Entry } from "../shared/entry.model";
import { CategoryService } from "../shared/entry.service";

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

  entries:Entry[] = []

  constructor(private categoryService: CategoryService) { }

  ngOnInit() {
    this.categoryService.getAll().subscribe(
      entries => this.entries = entries,
      error => alert('Erro ao carregar a lista'))
  }


  deleteCategory(entry){
    const mustDelete = confirm("Deseja realmente excluir esse item?")

    mustDelete&&
    this.categoryService.delete(entry.id).subscribe(
      ()=> this.entries = this.entries.filter(element => element != entry),
      ()=> alert("Erro ao tentar excluir")
    )
  }

}
