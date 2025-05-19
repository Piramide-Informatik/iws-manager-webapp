import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TITLE } from './title.data';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'app-title-table',
  standalone: false,
  templateUrl: './title-table.component.html',
  styleUrl: './title-table.component.scss'
})
export class TitleTableComponent implements OnInit, OnDestroy {

  titles = [...TITLE];
  titleColumns: any[] = [];
  titleDisplayedColumns: any[] = [];
  isChipsVisible = false;
  userPreferences: UserPreference = {};
  tableKey: string = 'Title'
  dataKeys = ['label', 'title'];

  @ViewChild('dt') dt!: Table;

  private langTitleSubscription!: Subscription;

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService,   
              private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.loadTitleHeadersAndColumns();
    this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.titleDisplayedColumns);
    this.langTitleSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadTitleHeadersAndColumns();
      this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.titleDisplayedColumns);
    });
  }

  onUserPreferencesChanges(userPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }

  loadTitleHeadersAndColumns() {
    this.loadTitleHeaders();
    this.titleDisplayedColumns = this.titleColumns.filter(col => col.field !== 'label');
  }

  loadTitleHeaders(): void {
    this.titleColumns = [
      {
        field: 'label',
        minWidth: 110,
        header: this.translate.instant(_('TITLE.TABLE_TITLE.TITLE_LABEL'))
      },
      {
        field: 'title',
        minWidth: 110,
        header: this.translate.instant(_('TITLE.TABLE_TITLE.TITLE'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langTitleSubscription) {
      this.langTitleSubscription.unsubscribe();
    }
  }

  applyTitleFilter(event: any, field: string) {
    const inputTitleFilterElement = event.target as HTMLInputElement;
    if (inputTitleFilterElement) {
      this.dt.filter(inputTitleFilterElement.value, field, 'contains');
    }
  }
}
