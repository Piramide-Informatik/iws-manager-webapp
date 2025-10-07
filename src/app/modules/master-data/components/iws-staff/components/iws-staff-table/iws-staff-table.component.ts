import { Component, OnInit, OnDestroy, inject, computed, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

import { EmployeeIwsStateService } from '../../utils/employee-iws-state.service';
import { EmployeeIwsService } from '../../../../../../Services/employee-iws.service';
import { EmployeeIwsUtils } from '../../utils/employee-iws-utils';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { EmployeeIws } from '../../../../../../Entities/employeeIws';
import { Column } from '../../../../../../Entities/column';
@Component({
  selector: 'app-iws-staff-table',
  templateUrl: './iws-staff-table.component.html',
  standalone: false,
  styles: ``,
})
export class IwsStaffTableComponent implements OnInit, OnDestroy {
  private readonly employeeIwsUtils = new EmployeeIwsUtils();
  private readonly employeeIwsService = inject(EmployeeIwsService);
  private readonly messageService = inject(MessageService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedEmployeeIws: number | null = null;
  NameEmployeeIws: string = '';

  readonly employeeIwss = computed(() => {
    return this.employeeIwsService.employeeIws()
  });


  iwsStaff: any[] = [];
  columnsHeaderFieldIwsStaff: Column[] = [];
  userIwsStaffTPreferences: UserPreference = {};
  tableKey: string = 'IwsStaffT'
  dataKeys = ['employeeNo', 'employeeLabel', 'firstname', 'lastname', 'mail'];


  @ViewChild('dt2') dt2!: Table;
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly employeeIwsStateService: EmployeeIwsStateService,
  ) { }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.loadColHeadersIwsStaff();
    this.userIwsStaffTPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldIwsStaff);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersIwsStaff();
      this.routerUtils.reloadComponent(true);
      this.userIwsStaffTPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldIwsStaff);
    });
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedEmployeeIws = event.data;

      this.NameEmployeeIws = this.employeeIwss().find(emp => emp.id === this.selectedEmployeeIws)?.employeeLabel ?? '';
    }
    this.visibleModal = true;
  }

  onUserIwsStaffTPreferencesChanges(userIwsStaffTPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userIwsStaffTPreferences));
  }

  loadColHeadersIwsStaff(): void {
    this.columnsHeaderFieldIwsStaff = [
      {
        field: 'employeeNo',
        classesTHead: ['fix-width'],
        header: this.translate.instant(_('IWS_STAFF.TABLE.STAFF_NUMBER')),
      },
      {
        field: 'employeeLabel',
        classesTHead: ['fix-width'],
        header: this.translate.instant(_('IWS_STAFF.TABLE.SHORT_NAME')),
      },
      {
        field: 'firstname',
        classesTHead: ['fix-width'],
        header: this.translate.instant(_('IWS_STAFF.TABLE.FIRST_NAME')),
      },
      {
        field: 'lastname',
        classesTHead: ['fix-width'],
        header: this.translate.instant(_('IWS_STAFF.TABLE.LAST_NAME')),
      },
      {
        field: 'mail',
        header: this.translate.instant(_('IWS_STAFF.TABLE.EMAIL')),
      },
      {
        field: 'active',
        header: this.translate.instant(_('IWS_STAFF.LABEL.ACTIVE')),
        filter: { type: 'boolean' }
      },
    ];
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedEmployeeIws = null;
    }
  }

  toastMessageDisplay(message: { severity: string, summary: string, detail: string }): void {
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    });
  }

  editEmployeeIws(employeeIws: EmployeeIws) {
    this.employeeIwsStateService.setEmployeeIwsToEdit(employeeIws);
  }

  onDeleteIwsStaffSucess() {
    this.employeeIwsStateService.clearTitle()
  }
}
