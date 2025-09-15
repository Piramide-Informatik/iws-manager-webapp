import { Component, ViewChild, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { Column } from '../../../../../../Entities/column';
import { Text } from '../../../../../../Entities/text';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { TextUtils } from '../../utils/text-utils';
import { TextService } from '../../../../../../Services/text.service';

@Component({
  selector: 'app-text-table',
  standalone: false,
  templateUrl: './text-table.component.html',
  styleUrl: './text-table.component.scss'
})
export class TextTableComponent implements OnInit, OnDestroy {
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly textUtils = inject(TextUtils);
  private readonly textService = inject(TextService);
  textColumns: Column[] = [];
  textDisplayedColumns: Column[] = [];
  isTextChipVisible = false;
  userTextPreferences: UserPreference = {};
  tableKey: string = 'Text'
  dataKeys = ['label', 'content'];
  public modalType: 'create' | 'delete' = 'create';
  public isVisibleModal: boolean = false;
  
  @ViewChild('dt') dt!: Table;

  private langTextSubscription!: Subscription;

  readonly texts = computed(() => {
    return this.textService.texts();
  });

  constructor(private readonly router: Router, private readonly userPreferenceService: UserPreferenceService, private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.textUtils.loadInitialData().subscribe();
    this.loadTextHeadersAndColumns();
    this.userTextPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.textDisplayedColumns)
    this.langTextSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadTextHeadersAndColumns();
      this.userTextPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.textDisplayedColumns)
    });
  }

  onUserTextPreferencesChanges(userTextPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userTextPreferences));
  }

  loadTextHeadersAndColumns() {
    this.loadTextHeaders();
    this.textDisplayedColumns = [...this.textColumns];
  }

  loadTextHeaders(): void {
    this.textColumns = [
      { field: 'label', minWidth: 110, header: this.translate.instant(_('TEXT.TABLE_TEXT.TEXT_LABEL')) },
      { field: 'content', customClasses: ['nowrap-row'], minWidth: 110, header: this.translate.instant(_('TEXT.TABLE_TEXT.TEXT')) }
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

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    
    this.isVisibleModal = true;
  }

  onCreateText(event: { created?: Text, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }
}
