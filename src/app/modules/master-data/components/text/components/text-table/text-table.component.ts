import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TEXT } from './text.data';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';

@Component({
  selector: 'app-text-table',
  standalone: false,
  templateUrl: './text-table.component.html',
  styleUrl: './text-table.component.scss'
})
export class TextTableComponent implements OnInit, OnDestroy {

  text = [...TEXT];
  textColumns: any[] = [];
  textDisplayedColumns: any[] = [];
  isTextChipVisible = false;
  userPreferences: UserPreference = {};
  tableKey: string = 'Text'
  dataKeys = ['label', 'text'];
  
  @ViewChild('dt') dt!: Table;

  private langTextSubscription!: Subscription;

  constructor(private readonly router: Router, private readonly userPreferenceService: UserPreferenceService, private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.loadTextHeadersAndColumns();
    this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.textDisplayedColumns)
    this.langTextSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadTextHeadersAndColumns();
      this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.textDisplayedColumns)
    });
  }

  onUserPreferencesChanges(userPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }

  loadTextHeadersAndColumns() {
    this.loadTextHeaders();
    this.textDisplayedColumns = [...this.textColumns];
  }

  loadTextHeaders(): void {
    this.textColumns = [
      {
        field: 'label',
        minWidth: 110,
        header: this.translate.instant(_('TEXT.TABLE_TEXT.TEXT_LABEL'))
      },
      {
        field: 'text',
        customClasses: ['nowrap-row'],
        minWidth: 110,
        header: this.translate.instant(_('TEXT.TABLE_TEXT.TEXT'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langTextSubscription) {
      this.langTextSubscription.unsubscribe();
    }
  }

  applyTextFilter(event: any, field: string) {
    const inputTextFilterElement = event.target as HTMLInputElement;
    if (inputTextFilterElement) {
      this.dt.filter(inputTextFilterElement.value, field, 'contains');
    }
  }
}
