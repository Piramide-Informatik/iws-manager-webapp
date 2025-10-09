import { Component, inject, OnDestroy, OnInit, ViewChild, computed } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { ModalFundingProgramComponent } from '../modal-funding-program/modal-funding-program.component';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { FundingProgram } from '../../../../../../Entities/fundingProgram';
import { FundingProgramUtils } from '../../utils/funding-program-utils';
import { FundingProgramService } from '../../../../../../Services/funding-program.service';
import { FundingProgramStateService } from '../../utils/funding-program-state.service';
import { Column } from '../../../../../../Entities/column';

@Component({
  selector: 'app-funding-programs-table',
  templateUrl: './funding-programs-table.component.html',
  styleUrls: ['./funding-programs-table.component.scss'],
  standalone: false,
})
export class FundingProgramsTableComponent implements OnInit, OnDestroy {
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly fundingProgramService = inject(FundingProgramService);
  private readonly fundingStateService = inject(FundingProgramStateService);
  @ViewChild('fundingProgramModal') fundingProgramModalComponent!: ModalFundingProgramComponent;
  public modalType: 'create' | 'delete' = 'create';
  public visibleModal: boolean = false;
  columnsHeaderFieldFundingProgram: Column[] = [];
  userFundingProgramsPreferences: UserPreference = {};
  tableKey: string = 'FundingPrograms'
  dataKeys = ['name', 'defaultFundingRate'];
  private langSubscription!: Subscription;
  selectedFunding!: FundingProgram | undefined;

  readonly fundingPrograms = computed(() => {
    return this.fundingProgramService.fundingPrograms()
  });

  constructor(
    private readonly fundingProgramUtils: FundingProgramUtils,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService
  ) {}

  ngOnInit(): void {
    this.fundingProgramUtils.loadInitialData().subscribe();
    this.loadColHeadersFundingProgram();
    this.userFundingProgramsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldFundingProgram);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersFundingProgram();
      this.userFundingProgramsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldFundingProgram);
    });
  }

  onUserFundingProgramsPreferencesChanges(userFundingProgramsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userFundingProgramsPreferences));
  }

  loadColHeadersFundingProgram(): void {
    this.columnsHeaderFieldFundingProgram = [
      {
        field: 'name',
        styles: { width: 'auto' },
        header: this.translate.instant(_('FUNDING.TABLE.PROGRAM')),
        useSameAsEdit: true
      },
      {
        field: 'defaultFundingRate',
        type: 'double',
        styles: { width: '100px' },
        header: this.translate.instant(_('FUNDING.TABLE.RATE')),
        customClasses: ['align-right']
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onDialogShow() {
    if (this.modalType === 'create' && this.fundingProgramModalComponent) {
      this.fundingProgramModalComponent.focusInputIfNeeded();
    }
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedFunding = this.fundingPrograms().find(fp => fp.id == event.data);
    }
    this.visibleModal = true;
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
  }

  onCreateFundingProgram(event: { created?: FundingProgram, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onDeleteFundingProgram(deleteEvent: {status: 'success' | 'error', error?: Error}): void {
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
  
  editFundingProgram(fundingProgram: FundingProgram): void {
    this.fundingStateService.setFundingProgramToEdit(fundingProgram);
  }
}
