import { Component, ViewChild, OnInit, OnDestroy, computed, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { StateUtils } from '../../utils/state-utils';
import { StateService } from '../../../../../../Services/state.service';
import { StateModalComponent } from '../state-modal/state-modal.component';
import { State } from '../../../../../../Entities/state';
import { StatesStateService } from '../../utils/states.state.service.service';
import { MessageService } from 'primeng/api';
import { Column } from '../../../../../../Entities/column';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-states-table',
  standalone: false,
  templateUrl: './states-table.component.html',
  styleUrl: './states-table.component.scss'
})
export class StatesTableComponent implements OnInit, OnDestroy {
  private readonly stateUtils = new StateUtils();
  private readonly stateService = inject(StateService);
  private readonly stateStateService = inject(StatesStateService);
  private readonly messageService = inject(MessageService);
  cols: Column[] = [];
  selectedColumns: Column[] = [];
  userStatesPreferences: UserPreference = {};
  tableKey: string = 'States'
  dataKeys = ['name'];
  visibleStateModal: boolean = false;
  stateModalType: 'create' | 'delete' = 'create';
  selectedState: number | null = null;
  stateName: string = '';
  readonly states = computed(() => {
    return this.stateService.states();
  });
  @ViewChild('stateModal') stateModalComponent!: StateModalComponent;
    
  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly statesState: StatesStateService,
    private readonly commonMessageService: CommonMessagesService
  ) {}

  ngOnInit() {
    this.stateUtils.loadInitialData().subscribe();
    this.updateHeadersAndColumns();
    this.userStatesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateHeadersAndColumns();
      this.userStatesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);
    });
  }

  onUserStatesPreferencesChanges(userStatesPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userStatesPreferences));
  }

  updateHeadersAndColumns() {
    this.loadColHeaders();
    this.selectedColumns = [...this.cols];
  }

  loadColHeaders(): void {
    this.cols = [
      {
        field: 'name',
        header: this.translate.instant(_('STATES.TABLE.STATE')),
        useSameAsEdit: true
      }
    ];
  }

  handleStateTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.stateModalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedState = event.data;

      this.stateName = this.states().find(state => state.id === this.selectedState)?.name ?? '';
    }
    this.visibleStateModal = true;
  }

  editState(state: State) {
    this.stateStateService.setStateToEdit(state);
  }

  onVisibleModal(visible: boolean) {
    this.visibleStateModal = visible;
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleStateModal = visible;
    if (!visible) {
      this.selectedState = null;
    }
  }

  onDialogShow() {
    if (this.stateModalType === 'create' && this.stateModalComponent) {
      this.stateModalComponent.focusStateInputIfNeeded();
    }
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onConfirmStateDelete(message: { severity: string, summary: string, detail: string }) {
    if (message.severity === 'success') {
      this.statesState.setStateToEdit(null);
      this.commonMessageService.showDeleteSucessfullMessage();
    } else {
      this.commonMessageService.showErrorDeleteMessage();
    }
  }
}
