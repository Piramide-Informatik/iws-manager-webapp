import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GERMAN_STATES } from './states.data';

@Component({
  selector: 'app-states-table',
  standalone: false,
  templateUrl: './states-table.component.html',
  styleUrl: './states-table.component.scss'
})
export class StatesTableComponent implements OnInit, OnDestroy {
  states = [...GERMAN_STATES];
  cols: any[] = [];
  selectedColumns: any[] = [];
  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.updateHeadersAndColumns();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateHeadersAndColumns();
    });
  }

  updateHeadersAndColumns() {
    this.loadColHeaders();
    this.selectedColumns = [...this.cols];
  }

  loadColHeaders(): void {
    this.cols = [
      {
        field: 'state',
        minWidth: 110,
        header: this.translate.instant(_('STATES.TABLE.STATE'))
      }
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]);
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  logAction(action: string, data?: any) {
    console.log(`${action}`, data ?? '');
  }

  editAbsenceType(absenceType: any) {
    this.logAction('Editing', absenceType);
  }

  deleteAbsenceType(id: number) {
    this.logAction('Deleting ID', id);
  }

  createAbsenceType() {
    this.logAction('Creating new state');
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}
