import { Component, ViewChild, OnInit, OnDestroy, inject, computed, SimpleChanges, OnChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { TitleService } from '../../../../../../Services/title.service';
import { TitleUtils } from '../../utils/title-utils';
import { Title } from '../../../../../../Entities/title';
import { TitleStateService } from '../../utils/title-state.service';
import { TitleModalComponent } from '../title-modal/title-modal.component';
import { MessageService } from 'primeng/api';
import { Column } from '../../../../../../Entities/column';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-title-table',
  standalone: false,
  templateUrl: './title-table.component.html',
  styleUrl: './title-table.component.scss'
})
export class TitleTableComponent implements OnInit, OnDestroy, OnChanges {
  private readonly titleUtils = new TitleUtils();
  private readonly titleService = inject(TitleService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedTitle: number | null = null;
  titleName: string = '';
  @ViewChild('titleModal') titleModalComponent!: TitleModalComponent;

  readonly titles = computed(() => {
    return this.titleService.titles();
  });

  titleColumns: Column[] = [];
  titleDisplayedColumns: Column[] = [];
  isChipsVisible = false;
  userTitlePreferences: UserPreference = {};
  tableKey: string = 'Title'
  dataKeys = ['name'];

  @ViewChild('dt2') dt2!: Table;

  private langTitleSubscription!: Subscription;

  constructor(private readonly userPreferenceService: UserPreferenceService,
              private readonly translate: TranslateService, 
              private readonly titleStateService: TitleStateService,
              private readonly messageService: MessageService,
              private readonly commonMessageService: CommonMessagesService) { }

  ngOnInit() {
    this.loadTitleHeadersAndColumns();
    this.userTitlePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.titleDisplayedColumns);
    this.langTitleSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadTitleHeadersAndColumns();
      this.userTitlePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.titleDisplayedColumns);
    });
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;

    if (event.type === 'delete' && event.data) {
      this.selectedTitle = event.data;

      this.titleName = this.titles().find(t => t.id === this.selectedTitle)?.name || '';
    }

    this.visibleModal = true;
  }

  onUserTitlePreferencesChanges(userTitlePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userTitlePreferences));
  }

  loadTitleHeadersAndColumns() {
    this.loadTitleHeaders();
    this.titleDisplayedColumns = [...this.titleColumns];
  }

  loadTitleHeaders(): void {
    this.titleColumns = [
      {
        field: 'name',
        header: this.translate.instant(_('TITLE.TABLE_TITLE.TITLE'))
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.langTitleSubscription) {
      this.langTitleSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['titles']) {
      this.prepareTableData();
    }
  }

  private prepareTableData() {
    if (this.titles().length > 0) {
      this.titleDisplayedColumns = [
        { field: 'name', header: 'Title' }
      ];
    }
  }

  applyTitleFilter(event: any, field: string) {
    const inputTitleFilterElement = event.target as HTMLInputElement;
    if (inputTitleFilterElement) {
      this.dt2.filter(inputTitleFilterElement.value, field, 'contains');
    }
  }

  editTitle(title: Title) {
    this.titleStateService.setTitleToEdit(title);
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedTitle = null;
    }
  }
  onDialogShow() {
    if (this.modalType === 'create' && this.titleModalComponent) {
      this.titleModalComponent.focusInputIfNeeded();
    }
  }

  toastMessageDisplay(message: { severity: string, summary: string, detail: string }): void {
    this.commonMessageService.showCustomSeverityAndMessage(message.severity, message.summary, message.detail);
  }

  onDeleteTitle() {
    this.titleStateService.clearTitle();
  }
}
