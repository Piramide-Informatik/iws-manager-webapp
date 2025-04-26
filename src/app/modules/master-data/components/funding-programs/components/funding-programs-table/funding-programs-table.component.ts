import { Component } from '@angular/core';

@Component({
  selector: 'app-funding-programs-table',
  standalone: false,
  templateUrl: './funding-programs-table.component.html',
  styleUrls: ['./funding-programs-table.component.scss'],
})
export class FundingProgramsTableComponent {
  fundingPrograms = [
    { id: 1, program: 'BMWi', rate: 25 },
    { id: 2, program: 'ZIM', rate: 45 },
    { id: 3, program: 'Eurostars', rate: 30 },
    { id: 4, program: 'Marketing', rate: 20 },
    { id: 5, program: 'FUE-Verw', rate: 40 },
    { id: 6, program: 'FZ', rate: 35 },
    { id: 7, program: 'Go-Inno', rate: 28 },
    { id: 8, program: 'GreenEconomy.IN.NRW', rate: 50 },
    { id: 9, program: 'KMU-Innovativ', rate: 38 },
    { id: 10, program: 'LuFo', rate: 32 },
    { id: 11, program: 'Messe', rate: 22 },
    { id: 12, program: 'NEXT.IN.NRW', rate: 27 },
    { id: 13, program: 'Sonstiges', rate: 33 },
    { id: 14, program: 'Studie', rate: 18 },
  ];

  originalFundingPrograms = [...this.fundingPrograms];
  cols = [
    { field: 'program', header: 'FUNDING.TABLE.PROGRAM' },
    { field: 'rate', header: 'FUNDING.TABLE.RATE' },
  ];

  selectedColumns = [...this.cols];

  applyFilter(event: Event, field: 'program' | 'rate') {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.fundingPrograms = this.originalFundingPrograms.filter((fp) => {
      const value = fp[field].toString().toLowerCase();
      return value.includes(filterValue);
    });
  }

  editFundingProgram(program: any) {
    console.log('Editing program:', program);
  }

  deleteFundingProgram(id: number) {
    this.fundingPrograms = this.fundingPrograms.filter((fp) => fp.id !== id);
    this.originalFundingPrograms = [...this.fundingPrograms];
  }

  createFundingProgram() {
    console.log('Creating new funding program...');
  }
}
