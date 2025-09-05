import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { CostTypeUtils } from '../../utils/cost-type-utils';
import { CostTypeService } from '../../../../../../Services/cost-type.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { CostType } from '../../../../../../Entities/costType';
import { CostTypeStateService } from '../../utils/cost-type-state.service';

@Component({
  selector: 'app-costs-table',
  standalone: false,
  templateUrl: './costs-table.component.html',
  styleUrl: './costs-table.component.scss',
})
export class CostsTableComponent implements OnInit, OnDestroy {
  private readonly costTypeUtils = new CostTypeUtils();
  private readonly costTypeService = inject(CostTypeService);
  private readonly costTypeStateService = inject(CostTypeStateService);
  columnsHeaderFieldCosts: any[] = [];
  userCostTablePreferences: UserPreference = {};
  tableKey: string = 'CostTable'
  dataKeys = ['name', 'sort'];
  isLoadingCostType = false;
  visibleCostTypeModal = false;
  modalType: 'create' | 'delete' = 'create';
  selectedCostType!: CostType | undefined;
  private readonly costTypesMap: Map<number, CostType> = new Map();
  private langSubscription!: Subscription;

  readonly costsUI = computed(() => {
    const costTypes = this.costTypeService.costTypes();
    costTypes.forEach(cost => this.costTypesMap.set(cost.id, cost));
    return costTypes.map(cost => ({
      id: cost.id,
      name: cost.type,
      sort: cost.sequenceNo
    }));
  });

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly commonMessageService: CommonMessagesService
  ) {}

  ngOnInit(): void {
    this.costTypeUtils.loadInitialData().subscribe()
    this.loadColHeadersCost();
    this.userCostTablePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCosts);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersCost();
      this.routerUtils.reloadComponent(true);
      this.userCostTablePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCosts);
    });
  }

  onUserCostTablePreferencesChanges(userCostTablePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userCostTablePreferences));
  }

  loadColHeadersCost(): void {
    this.columnsHeaderFieldCosts = [
      {
        field: 'name',
        styles: { width: 'auto' },
        header: this.translate.instant(_('COSTS.TABLE.NAME')),
      },
      {
        field: 'sort',
        styles: { width: '100px' },
        header: this.translate.instant(_('COSTS.TABLE.SORT')),
        customClasses: ['align-right']
      },
    ];
  }

  openCostTypeModal(event: { type: 'create' | 'delete', data?: number }) {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      const costTypeId = event.data;
      this.selectedCostType = this.costTypesMap.get(costTypeId);
    }
    this.visibleCostTypeModal = true;
  }

  onCostTypeDelete(deleteEvent: {status: 'success' | 'error', error?: Error}): void {
    if (deleteEvent.status === 'success') {
      this.commonMessageService.showDeleteSucessfullMessage();
    } else if (deleteEvent.status === 'error' && deleteEvent.error) {
      if (deleteEvent.error?.toString().includes('it is in use by other entities')) {
        this.commonMessageService.showErrorDeleteMessageUsedByOtherEntities();
      } else {
        this.commonMessageService.showErrorDeleteMessage();
      }
    }
    this.visibleCostTypeModal = false;
  }

  onCostTypeCreate(event: { created?: CostType, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleCostTypeModal = visible;
  }

  editCostType(costType: {id: number, type: string, sequenceNo: number}): void {
    const costTypeToEdit = this.costTypesMap.get(costType.id) ?? null;
    this.costTypeStateService.setCostTypeToEdit(costTypeToEdit);
  }
}
