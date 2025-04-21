import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from "@ngx-translate/core";
import { Router } from '@angular/router';

@Component({
  selector: 'app-states-table',
  standalone: false,
  templateUrl: './states-table.component.html',
  styleUrl: './states-table.component.scss'
})
export class StatesTableComponent implements OnInit, OnDestroy {
  states: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(private readonly translate: TranslateService, private readonly router: Router) { }

  ngOnInit() {
    this.states = [
      {
        id: 1,
        state: 'Baden-Wurttemberg',
      },
      {
        id: 2,
        state: 'Bayern',
      },
      {
        id: 3,
        state: 'Berlin',
      },
      {
        id: 4,
        state: 'Bremen',
      },
      {
        id: 5,
        state: 'Hamburg',
      },
      {
        id: 6,
        state: 'Hessen',
      },
      {
        id: 7,
        state: 'Mecklenburg-Vorpommern',
      },
      {
        id: 8,
        state: 'Niedersachsen',
      },
      {
        id: 9,
        state: 'Rheinland-Pfalz',
      },
      {
        id: 10,
        state: 'Saarland',
      },
      {
        id: 11,
        state: 'Sachsen',
      },
    ];

    this.loadColHeaders();
    this.selectedColumns = [...this.cols];

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.selectedColumns = [...this.cols];
    });
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'state', minWidth: 110, header: this.translate.instant(_('STATES.TABLE.STATE')) },
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  editAbsenceType(absenceType: any) {
    console.log('Editing', absenceType);
  }

  deleteAbsenceType(id: number) {
    console.log('Deleting ID', id);
  }

  createAbsenceType() {
    console.log('Creating new state');
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}
