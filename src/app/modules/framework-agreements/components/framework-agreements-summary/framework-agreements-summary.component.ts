import { Component, OnInit, ViewChild } from '@angular/core';
import { FrameworkAgreements } from '../../../../Entities/Framework-agreements';
import { FrameworkAgreementsService } from '../../services/framework-agreements.service';
import { Table } from 'primeng/table';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-framework-agreements-summary',
  standalone: false,
  templateUrl: './framework-agreements-summary.component.html',
  styleUrl: './framework-agreements-summary.component.scss'
})
export class FrameworkAgreementsSummaryComponent implements OnInit {

  public frameworkAgreements!: FrameworkAgreements[];

  @ViewChild('dt2') dt2!: Table;

  public cols: Column[] = [
    { field: 'id', header: 'No' },
    { field: 'frameworkContract', header: 'Framework Contract' },
    { field: 'date', header: 'Date' },
    { field: 'fundingProgram', header: 'Funding Program' },
    { field: 'contractStatus', header: 'Contract Status' },
    { field: 'iwsEmployee', header: 'IWS Employee' },
  ];

  public selectedColumns!: Column[];

  constructor(private FrameworkAgreementsService: FrameworkAgreementsService) {}

  ngOnInit() {
    this.frameworkAgreements = this.FrameworkAgreementsService.list();

    this.selectedColumns = this.cols;
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  deleteFrameworkAgreement(id: number) {
    this.frameworkAgreements = this.frameworkAgreements.filter(agreement => agreement.id !== id);
  }
}