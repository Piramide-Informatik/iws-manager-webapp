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

@Component({
  selector: 'app-states-table',
  standalone: false,
  templateUrl: './states-table.component.html',
  styleUrl: './states-table.component.scss'
})
export class StatesTableComponent implements OnInit, OnDestroy {
  private readonly stateUtils = new StateUtils();
  private readonly stateService = inject(StateService);
  private readonly messageService = inject(MessageService);
  cols: any[] = [];
  selectedColumns: any[] = [];
  userStatesPreferences: UserPreference = {};
  tableKey: string = 'States'
  dataKeys = ['state'];
  visibleStateModal: boolean = false;
  stateModalType: 'create' | 'delete' = 'create';
  selectedState: number | null = null;
  stateName: string = '';
  readonly states = computed(() => {
    return this.stateService.states().map(state => ({
      id: state.id,
      name: state.name,
    }));
  });
  @ViewChild('stateModal') stateModalComponent!: StateModalComponent;
    
  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly statesState: StatesStateService
  ) {}

  ngOnInit() {
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
        minWidth: 110,
        header: this.translate.instant(_('STATES.TABLE.STATE'))
      }
    ];
  }

  handleStateTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.stateModalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedState = event.data;

      this.stateUtils.getStateById(this.selectedState!).subscribe({
        next: (state) => {
          this.stateName = state?.name ?? '';
        },
        error: (err) => {
          console.error('No se pudo obtener el estado:', err);
          this.stateName = '';
        }
      });
    }
    this.visibleStateModal = true;
  }

  editState(state: State) {
    const stateToEdit: State = {
      id: state.id,
      name: state.name,
      createdAt: '',
      updatedAt: ''
    };

    this.stateUtils.getStateById(stateToEdit.id).subscribe({
      next: (fullState) => {
        if (fullState) {
          this.statesState.setStateToEdit(fullState);
        }
      },
      error: (err) => {
        console.error('Error al cargar el estado:', err);
      }
    });
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

  onConfirmStateDelete(message: { severity: string, summary: string, detail: string }) {
      this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    });
  }
}
