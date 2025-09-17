import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { ChanceUtils } from './utils/chance-utils';
import { ChanceService } from '../../../../Services/chance.service';
import { ChanceStateService } from './utils/chance-state.service';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { Column } from '../../../../Entities/column';
import { Chance } from '../../../../Entities/chance';

@Component({
  selector: 'app-realitation-probabilities',
  standalone: false,
  templateUrl: './realitation-probabilities.component.html',
  styles: ``
})
export class RealitationProbabilitiesComponent implements OnInit, OnDestroy {
  private readonly chanceUtils = inject(ChanceUtils);
  private readonly chanceService = inject(ChanceService);
  private readonly chanceStateService = inject(ChanceStateService);
  private readonly commonMessageService = inject(CommonMessagesService);

  public modalType: 'create' | 'delete' = 'create';
  public visibleModal: boolean = false;
  public selectedChance!: Chance;
  public readonly probabilities = computed(() => {
    return this.chanceService.chances();
  });

  // Configuration table
  public columsHeaderFieldProbabilities: Column[] = [];
  userRealitationProbabilitiesPreferences: UserPreference = {};
  tableKey: string = 'RealitationProbabilities'
  dataKeys = ['probability'];

  private langSubscription!: Subscription;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.chanceUtils.loadInitialData().subscribe();
    this.loadColHeadersProbabilities();
    this.userRealitationProbabilitiesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProbabilities);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersProbabilities();
      this.routerUtils.reloadComponent(true);
      this.userRealitationProbabilitiesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProbabilities);
    });
  }

  onUserRealitationProbabilitiesPreferencesChanges(userRealitationProbabilitiesPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userRealitationProbabilitiesPreferences));
  }
  
  loadColHeadersProbabilities(): void {
    this.columsHeaderFieldProbabilities = [
      { field: 'probability', type: 'double', header: this.translate.instant(_('SIDEBAR.REALIZATION_PROBABILITIES')), customClasses: ['align-right'] },
    ];
  }
  
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      const chanceFound = this.chanceService.chances().find(c => c.id == event.data);
      if (chanceFound) {
        this.selectedChance = chanceFound;
      }
    }
    this.visibleModal = true;
  }

  onCreateChance(event: { created?: Chance, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }
  
  onDeleteChance(deleteEvent: {status: 'success' | 'error', error?: Error}): void {
    if(deleteEvent.status === 'success'){
      this.commonMessageService.showDeleteSucessfullMessage();
    }else if(deleteEvent.status === 'error' && deleteEvent.error){
      if(deleteEvent.error.message === 'Cannot delete register: it is in use by other entities'){
        this.commonMessageService.showErrorDeleteMessageUsedByOtherEntities();
      }else{
        this.commonMessageService.showErrorDeleteMessage();
      }
    }
  }
}
