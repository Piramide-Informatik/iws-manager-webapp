import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild, computed, inject } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { SalutationUtils } from '../../utils/salutation.utils';
import { SalutationService } from '../../../../../../Services/salutation.service';
import { Salutation } from '../../../../../../Entities/salutation';
import { SalutationStateService } from '../../utils/salutation-state.service';
import { SalutationModalComponent } from '../salutation-modal/salutation-modal.component';
import { MessageService } from 'primeng/api';
import { Column } from '../../../../../../Entities/column';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'master-data-salutation-table',
  standalone: false,
  templateUrl: './salutation-table.component.html',
  styleUrl: './salutation-table.component.scss'
})
export class SalutationTableComponent implements OnInit, OnDestroy, OnChanges {

  private readonly salutationUtils = new SalutationUtils();
  private readonly salutationService = inject(SalutationService);
  private readonly messageService =  inject(MessageService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedSalutation: number | null = null;
  salutationName: string = '';
  @ViewChild('salutationModal') salutationModalComponent!: SalutationModalComponent;

  salutationColumns: Column[] = [];
  salutationDisplayedColumns: Column[] = [];
  isChipsVisible = false;
  userSalutationPreferences: UserPreference = {};
  tableKey: string = 'Salutation';
  dataKeys = ['name'];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  readonly salutations = computed(() => {
    return this.salutationService.salutations();
  });

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedSalutation = event.data;

      this.salutationName = this.salutations().find(s => s.id === this.selectedSalutation)?.name ?? '';
    }
    this.visibleModal = true;
  }

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly salutationStateService: SalutationStateService,
    private readonly commonMessageService: CommonMessagesService
  ) {}

  ngOnInit(): void {
    this.salutationUtils.loadInitialData().subscribe();
    this.loadSalutationHeadersAndColumns();
    this.userSalutationPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.salutationDisplayedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadSalutationHeadersAndColumns();
      this.userSalutationPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.salutationDisplayedColumns);
    });
  }

  onUserSalutationPreferencesChanges(userSalutationPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userSalutationPreferences));
  }

  loadSalutationHeadersAndColumns() {
    this.loadSalutationHeaders();
    this.salutationDisplayedColumns = this.salutationColumns.filter(col => col.field !== 'label');
  }

  loadSalutationHeaders(): void {
    this.salutationColumns = [
      { field: 'name', header: this.translate.instant(_('SALUTATION.TABLE.SALUTATION')), useSameAsEdit: true }
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['salutations']) {
      this.prepareTableData();
    }
  }

  private prepareTableData() {
    if (this.salutations().length > 0) {
      this.salutationDisplayedColumns = [
        { field: 'name', header: 'Salutation' }
      ];
    }
  }

  applySalutationFilter(event: any, field: string) {
    const inputSalutationFilterElement = event.target as HTMLInputElement;
    if (inputSalutationFilterElement) {
      this.dt2.filter(inputSalutationFilterElement.value, field, 'contains');
    }
  }

  editSalutation(salutation: Salutation) {
    this.salutationStateService.setSalutationToEdit(salutation);
  }

  onVisibleModal(visible: boolean){
    this.visibleModal = visible;
  }
  
  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if(!visible) {
      this.selectedSalutation = null;
    }
  }

  onDialogShow() {
    if (this.modalType === 'create' && this.salutationModalComponent) {
      this.salutationModalComponent.focusInputIfNeeded();
    }
  }

  onDeleteConfirm(message: {severity: string, summary: string, detail: string}): void {
    if (message.severity === 'success') {
      this.salutationStateService.clearSalutation();
      this.commonMessageService.showCreatedSuccesfullMessage()
    } else {
      this.commonMessageService.showErrorDeleteMessage()
    }
  }
}
