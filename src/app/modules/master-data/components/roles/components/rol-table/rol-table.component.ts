import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GERMAN_ROLES } from './roles.data';


@Component({
  selector: 'app-rol-table',
  standalone: false,
  templateUrl: './rol-table.component.html',
  styleUrl: './rol-table.component.scss'
})
export class RolTableComponent implements OnInit, OnDestroy {

  roles = [...GERMAN_ROLES];
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
        field: 'rol',
        minWidth: 110,
        header: this.translate.instant(_('ROLES.TABLE_ROLES.USER_ROL'))
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

  editRol(absenceType: any) {
    this.logAction('Editing', absenceType);
  }

  deleteRol(id: number) {
    this.logAction('Deleting ID', id);
  }

  createRol() {
    this.logAction('Creating new state');
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}
