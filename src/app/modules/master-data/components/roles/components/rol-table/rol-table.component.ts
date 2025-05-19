import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { GERMAN_ROLES } from './roles.data';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

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
  userRolPreferences: UserPreference = {};
  tableKey: string = 'Rol'
  dataKeys = ['rol'];

  @ViewChild('dt') dt!: Table;

  private langSubscription!: Subscription;

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService, 
              private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.updateHeadersAndColumns();
    this.userRolPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateHeadersAndColumns();
      this.userRolPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);
    });
  }

  onUserRolPreferencesChanges(userRolPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userRolPreferences));
  }

  updateHeadersAndColumns() {
    this.loadColumnHeaders();
    this.selectedColumns = [...this.cols];
  }

  loadColumnHeaders(): void {
    this.cols = [
      {
        field: 'rol',
        minWidth: 110,
        header: this.translate.instant(_('ROLES.TABLE_ROLES.USER_ROL'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt.filter(inputElement.value, field, 'contains');
    }
  }
}
