import { Component, OnInit, ViewChild, OnDestroy, inject, computed } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from "@ngx-translate/core";
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { AbsenceType } from '../../../../../../Entities/absenceType';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { AbsenceTypeUtils } from '../../utils/absence-type-utils';
import { AbsenceTypeService } from '../../../../../../Services/absence-type.service';
import { Column } from '../../../../../../Entities/column';
import { AbsenceTypeStateService } from '../../utils/absence-type-state.service';

@Component({
  selector: 'app-absence-types-table',
  standalone: false,
  templateUrl: './absence-types-table.component.html',
  styleUrl: './absence-types-table.component.scss'
})
export class AbsenceTypesTableComponent implements OnInit, OnDestroy {
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly absenceTypeUtils = inject(AbsenceTypeUtils);
  private readonly absenceTypeService = inject(AbsenceTypeService);
  private readonly absenceStateService = inject(AbsenceTypeStateService);
  
  readonly absenceTypes = computed(() => {
    return this.absenceTypeService.absenceTypes().map(aType => ({
      id: aType.id,
      version: aType.version,
      createdAt: aType.createdAt,
      updatedAt: aType.updatedAt,
      type: aType.name,
      abbreviation: aType.label,
      fractionOfDay: aType.shareOfDay,
      isVacation: aType.isHoliday && aType.isHoliday == 1,
      canBeBooked: aType.hours && aType.hours == 1
    }));
  });
  
  cols: Column[] = [];
  selectedColumns: Column[] = [];
  userAbsenceTypePreferences: UserPreference = {};
  tableKey: string = 'AbsenceType'
  dataKeys = ['type', 'abbreviation', 'fractionOfDay', 'isVacation', 'canBeBooked'];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  public modalType: 'create' | 'delete' = 'create';
  public visibleModal: boolean = false;
  public selectedAbsenceType!: AbsenceType;

  constructor(
    private readonly translate: TranslateService, 
    private readonly userPreferenceService: UserPreferenceService, 
    private readonly router: Router
  ) { }

  ngOnInit() {
    this.absenceTypeUtils.loadInitialData().subscribe();
    this.loadColHeaders();
    this.selectedColumns = [...this.cols];
    this.userAbsenceTypePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.selectedColumns = [...this.cols];
      this.userAbsenceTypePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  onUserAbsenceTypePreferencesChanges(userAbsenceTypePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userAbsenceTypePreferences));
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'type', header: this.translate.instant(_('ABSENCE_TYPES.LABEL.TYPE')), useSameAsEdit: true },
      { field: 'abbreviation', header: this.translate.instant(_('ABSENCE_TYPES.LABEL.ABBREVIATION')) },
      { field: 'fractionOfDay', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('ABSENCE_TYPES.LABEL.FRACTION_OF_DAY')) },
      { field: 'isVacation', filter:{ type: 'boolean'}, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.IS_VACATION')) },
      { field: 'canBeBooked', filter:{ type: 'boolean'}, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.CAN_BE_BOOKED')) }
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
  }

  onCreateAbsenceType(event: { created?: AbsenceType, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onDeleteAbsenceType(deleteEvent: {status: 'success' | 'error', error?: Error}): void {
    if(deleteEvent.status === 'success'){
      this.absenceStateService.clearAbsenceType();
      this.commonMessageService.showDeleteSucessfullMessage();
    }else if(deleteEvent.status === 'error' && deleteEvent.error){
      if(deleteEvent.error.message === 'Cannot delete register: it is in use by other entities'){
        this.commonMessageService.showErrorDeleteMessageUsedByOtherEntities();
      }else{
        this.commonMessageService.showErrorDeleteMessage();
      }
    }
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      const absenceTypeFound = this.absenceTypeService.absenceTypes().find(at => at.id == event.data);
      if (absenceTypeFound) {
        this.selectedAbsenceType = absenceTypeFound;
      }
    }
    this.visibleModal = true;
  }

  editAbsenceType(absenceType: any): void {
    this.absenceStateService.setAbsenceTypeToEdit({
      id: absenceType.id,
      version: absenceType.version,
      createdAt: absenceType.createdAt,
      updatedAt: absenceType.updatedAt,
      name: absenceType.type,
      label: absenceType.abbreviation,
      shareOfDay: absenceType.fractionOfDay,
      isHoliday: absenceType.isVacation ? 1 : 0,
      hours: absenceType.canBeBooked ? 1 : 0
    })
  }
}