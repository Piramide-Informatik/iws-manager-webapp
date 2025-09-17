import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { DunningLevelUtils } from './utils/dunning-level.utils';
import { ReminderLevelService } from '../../../../Services/reminder-level.service';
import { ReminderLevel } from '../../../../Entities/reminderLevel';
import { CommonMessagesService } from '../../../../Services/common-messages.service';

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
  dataKeys = ['levelNo', 'reminderText'];
  visibleDunningLevelModal = false;
  modalType: 'create' | 'delete' = 'create';
  readonly dunningLevels = computed(() => {
    return this.reminderLevelService.reminders();
  });
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly commonMessageService: CommonMessagesService
  ){}

  ngOnInit(): void {
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
      { field: 'levelNo', styles: {'width': '100px'}, header: this.translate.instant(_('DUNNING_LEVELS.LABEL.DUNNING_LEVEL')), customClasses: ['align-right']  },
      { field: 'reminderText', styles: {'width': 'auto'},  header: this.translate.instant(_('DUNNING_LEVELS.LABEL.TEXT')) },
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

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    this.visibleDunningLevelModal = true;
  }
}
