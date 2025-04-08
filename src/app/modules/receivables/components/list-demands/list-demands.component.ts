import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-list-demands',
  standalone: false,
  templateUrl: './list-demands.component.html',
  styleUrl: './list-demands.component.scss'
})
export class ListDemandsComponent implements OnInit {

  public demands!: any[];

  @ViewChild('dt2') dt2!: Table;

  public cols: Column[] = [
    { field: 'idClaim', header: 'Claim No'},
    { field: 'idOrder', header: 'Order No'},
    { field: 'orderTitle', header: 'Order Title'},
    { field: 'kind', header: 'Kind'},
    { field: 'land', header: 'Land'},
    { field: 'place', header: 'Place'},
    { field: 'contact', header: 'Contact'},
    { field: 'contact', header: 'Contact'},
    { field: 'contact', header: 'Contact'},
    { field: 'contact', header: 'Contact'},
    { field: 'contact', header: 'Contact'},
    { field: 'contact', header: 'Contact'},
    { field: 'contact', header: 'Contact'},
    { field: 'contact', header: 'Contact'},
    { field: 'contact', header: 'Contact'},
    { field: 'contact', header: 'Contact'},
    { field: 'contact', header: 'Contact'},
  ];

  public selectedColumns!: Column[];

  constructor(){}

  ngOnInit(): void {
    this.selectedColumns = this.cols;
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  deleteCustomer(id: number){
    this.demands = this.demands.filter( demand => demand.id !== id);
  }
}
