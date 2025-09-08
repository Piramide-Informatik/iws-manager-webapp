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
  readonly absenceTypes = computed(() => {
    return this.absenceTypeService.absenceTypes().map(aType => ({
      id: aType.id,
      type: aType.name,
      abbreviation: aType.label,
      fractionOfDay: aType.hours,
      isVacation: aType.isHoliday && aType.isHoliday == 1,
      canBeBooked: aType.shareofday
    }));
  });
  cols: any[] = [];
  selectedColumns: any[] = [];
  userAbsenceTypePreferences: UserPreference = {};
  tableKey: string = 'AbsenceType'
  dataKeys = ['type', 'abbreviation', 'fractionOfDay', 'isVacation', 'canBeBooked'];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  public modalType: 'create' | 'delete' = 'create';
  public visibleModal: boolean = false;
  public selectedAbsenceType!: any  | undefined;

  constructor(private readonly translate: TranslateService, private readonly userPreferenceService: UserPreferenceService, private readonly router: Router) { }

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
      { field: 'type', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.TYPE')) },
      { field: 'abbreviation', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.ABBREVIATION')) },
      { field: 'fractionOfDay', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.FRACTION_OF_DAY')) },
      { field: 'isVacation', filter:{ type: 'boolean'},minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.IS_VACATION')) },
      { field: 'canBeBooked', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.CAN_BE_BOOKED')) }
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
      this.commonMessageService.showDeleteSucessfullMessage();
    }else if(deleteEvent.status === 'error' && deleteEvent.error){
      if(deleteEvent.error.message === 'Version conflict: absence type has been updated by another user'){
        this.commonMessageService.showErrorDeleteMessageUsedByOtherEntities();
      }else{
        this.commonMessageService.showErrorDeleteMessage();
      }
    }
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedAbsenceType = this.absenceTypes().find(at => at.id == event.data);
    }
    this.visibleModal = true;
  }
}
