import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { EmployeeIwsStateService } from '../../utils/employee-iws-state.service';
import { EmployeeIwsService } from '../../../../../../Services/employee-iws.service';
import { EmployeeIwsUtils } from '../../utils/employee-iws-utils';
import { MessageService } from 'primeng/api';

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
  selectedUser: number | null = null;
  NameEmployeeIws: string = '';

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedUser = event.data;

      this.employeeIwsUtils.getEmployeeIwsById(this.selectedUser!).subscribe({
        next: (employeeIws) => {
          this.NameEmployeeIws = employeeIws?.firstname ?? '';
        },
        error: (err) => {
          console.error('Could not get employeeIws:', err);
          this.NameEmployeeIws = '';
        }
      });
    }
    this.visibleModal = true;
  }

    readonly employeeIwss = computed(() => {
    return this.employeeIwsService.employeeIws().map(employeeIws => ({
      id: employeeIws.id,
      abbreviation: employeeIws.employeeLabel,
      firstName: employeeIws.firstname,
      lastName: employeeIws.lastname,
      email: employeeIws.mail,
    }));
  });


  iwsStaff: any[] = [];
  columnsHeaderFieldIwsStaff: any[] = [];
  userIwsStaffTPreferences: UserPreference = {};
  tableKey: string = 'IwsStaffT'
  dataKeys = ['type', 'abbreviation', 'firstName', 'lastName', 'email'];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly employeeIwsStateService: EmployeeIwsStateService,
  ) {}

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

  onUserIwsStaffTPreferencesChanges(userIwsStaffTPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userIwsStaffTPreferences));
  }

  loadColHeadersIwsStaff(): void {
    this.columnsHeaderFieldIwsStaff = [
      {
        field: 'abbreviation',
        styles: { width: '100px' },
        header: this.translate.instant(_('IWS_STAFF.TABLE.SHORT_NAME')),
      },
      {
        field: 'firstName',
        styles: { width: '150px' },
        header: this.translate.instant(_('IWS_STAFF.TABLE.FIRST_NAME')),
      },
      {
        field: 'lastName',
        styles: { width: '150px' },
        header: this.translate.instant(_('IWS_STAFF.TABLE.LAST_NAME')),
      },
      {
        field: 'email',
        styles: { width: 'auto' },
        header: this.translate.instant(_('IWS_STAFF.TABLE.EMAIL')),
      },
    ];
  }
}
