import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Contractor } from '../../../../Entities/contractor';
import { ContractorService } from '../../services/contractor.service';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-contractor-overview',
  standalone: false,
  templateUrl: './contractor-overview.component.html',
  styleUrl: './contractor-overview.component.scss'
})
export class ContractorOverviewComponent implements OnInit {

  public contractors!: Contractor[];

  public customer!: string;

  @ViewChild('dt2') dt2!: Table;

  public cols: Column[] = [
    { field: 'contractorLabel', header: 'Kurzname' },
    { field: 'contractorName', header: 'Name' },
    { field: 'countryLabel', header: 'Land' },
    { field: 'street', header: 'Straße' },
    { field: 'zipCode', header: 'PLZ' },
    { field: 'city', header: 'Ort' },
    { field: 'taxNro', header: 'USt.-Ident-Nr.' }
  ];

  public selectedColumns!: Column[];

  constructor(private contractorService: ContractorService) { }

  ngOnInit() {
    this.contractors = this.contractorService.list();

    this.selectedColumns = this.cols;

    this.customer = 'Valentin Laime'
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  deleteCustomer(id: number) {
    //this.contractors = this.contractors.filter( contractor => contractor.contractorLabel !== id);
  }
}
