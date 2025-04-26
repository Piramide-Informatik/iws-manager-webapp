import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';

@Component({
  selector: 'app-funding-programs-table',
  standalone: false,
  templateUrl: './funding-programs-table.component.html',
  styleUrl: './funding-programs-table.component.scss',
})
export class FundingProgramsTableComponent implements OnInit, OnDestroy {
  fundingPrograms = [
    { id: 1, program: 'BMWi', rate: 25 },
    { id: 2, program: 'ZIM', rate: 45 },
    { id: 3, program: 'Eurostars', rate: 30 },
    { id: 4, program: 'Marketing', rate: 20 },
  ];

  cols = [
    { field: 'program', headerKey: 'PROGRAM' },
    { field: 'rate', headerKey: 'RATE' },
  ];

  selectedColumns: any[] = [];

  @ViewChild('dt2') dt2!: Table;
  private langSubscription!: Subscription;

  constructor(private readonly translate: TranslateService) {}

  ngOnInit() {
    this.setTranslatedHeaders();
    this.selectedColumns = [...this.cols];

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.setTranslatedHeaders();
      this.selectedColumns = [...this.cols];
    });
  }

  setTranslatedHeaders(): void {
    this.cols = this.cols.map((col) => ({
      ...col,
      header: this.translate.instant(_(`FUNDING.TABLE.${col.headerKey}`)),
    }));
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  editFundingProgram(program: any) {
    console.log('Editar Programa:', program);
  }

  deleteFundingProgram(id: number) {
    console.log('Eliminar Programa con ID:', id);
  }

  createFundingProgram() {
    console.log('Crear Nuevo Programa');
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
