import { Component, computed, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { DunningLevelUtils } from './utils/dunning-level.utils';
import { ReminderLevelService } from '../../../../Services/reminder-level.service';
import { ReminderLevel } from '../../../../Entities/reminderLevel';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { PageTitleService } from '../../../../shared/services/page-title.service';
import { DunningLevelModalComponent } from './components/dunning-level-modal/dunning-level-modal.component';

@Component({
  selector: 'app-dunning-levels',
  standalone: false,
  templateUrl: './dunning-levels.component.html',
  styles: []
})
export class DunningLevelsComponent implements OnInit, OnDestroy {
  private readonly dunningUtils = inject(DunningLevelUtils);
  private readonly reminderLevelService = inject(ReminderLevelService);
  columsHeaderField: any[] = [];
  userDunningPreferences: UserPreference = {};
  tableKey: string = 'Dunning'
  dataKeys = ['levelNo', 'reminderTitle'];
  visibleDunningLevelModal = false;
  modalType: 'create' | 'delete' = 'create';
  selectedDunningLevel!: ReminderLevel | null;
  selectedDunningLevelToEdit!: ReminderLevel | null;
  readonly dunningLevels = computed(() => {
    return this.reminderLevelService.reminders();
  });
  private langSubscription!: Subscription;
  @ViewChild('dunnigLevelModal') dunningLevelDialog!: DunningLevelModalComponent;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly commonMessageService: CommonMessagesService,
    private readonly pageTitleService: PageTitleService,
  ){}

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.DUNNING_LEVELS');
    this.dunningUtils.loadInitialData().subscribe();
    this.loadColHeaders();
    this.userDunningPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderField);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.routerUtils.reloadComponent(true);
      this.userDunningPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderField);
    });
  }

  onUserDunningPreferencesChanges(userDunningPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userDunningPreferences));
  }

  loadColHeaders(): void {
    this.columsHeaderField = [
      { field: 'levelNo', classesTHead: ['width-10'], header: this.translate.instant(_('DUNNING_LEVELS.LABEL.DUNNING_LEVEL')), customClasses: ['align-right'], useSameAsEdit: true, type: 'integer', filter : { type: 'numericOperators' }  },
      { field: 'reminderTitle',  header: this.translate.instant(_('DUNNING_LEVELS.LABEL.DESIGNATION')) },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onModalVisibilityChange(isVisible: boolean) {
    this.visibleDunningLevelModal = isVisible;
  }

  onCreateDunningLevel(event: {created?: ReminderLevel, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onDeleteDunningLevel(event: {status: 'success' | 'error', error?: Error}) {
    if(event.status === 'success'){
      this.selectedDunningLevelToEdit = null;
      this.commonMessageService.showDeleteSucessfullMessage();
    } else if(event.status === 'error'){
      event.error?.message === 'Cannot delete register: it is in use by other entities' ?
        this.commonMessageService.showErrorDeleteMessageUsedByOtherEntities() :
        this.commonMessageService.showErrorDeleteMessage();
    }
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete') {
      const foundDunningLevel = this.dunningLevels().find(dl => dl.id == event.data);
      if (foundDunningLevel) {
        this.selectedDunningLevel = foundDunningLevel;
      }
    }
    this.visibleDunningLevelModal = true;
  }

  onEditDunningLevel(value: ReminderLevel) {
    this.selectedDunningLevelToEdit = value;
  }

  onCancelEdit(value: any) {
    this.selectedDunningLevelToEdit = null;
  }

  onModalDunningLevelClose() {
    if (this.dunningLevelDialog) {
      this.dunningLevelDialog.closeModal();
    }
  }
}
