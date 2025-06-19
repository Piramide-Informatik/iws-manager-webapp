import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Employee } from '../../../../Entities/Employee';
import { EmployeeService } from '../../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';


interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-employee-overview',
  standalone: false,
  providers: [MessageService, ConfirmationService, Employee],
  templateUrl: './employee-overview.component.html',
  styleUrl: './employee-overview.component.scss'
})
export class EmployeeOverviewComponent implements OnInit, OnDestroy {
  public customer!: string;
  public customerLabel!: string;
  employees: Employee[] = [];
  selectedCustomers!: WorkContract[] | null;
  selectedCustomer!: WorkContract[] | null;
  submitted: boolean = true;
  statuses!: any[];
  @ViewChild('dt2') dt2!: Table;
  loading: boolean = true;
  public cols!: Column[];
  private langSubscription!: Subscription;

  public selectedColumns!: Column[];
  public filterCols!: Column[];
  public selectedFilterColumns!: Column[];
  userEmployeeOverviewPreferences: UserPreference = {};
  tableKey: string = 'EmployeeOverview'
  dataKeys = ['id', 'firstName', 'lastName', 'email', 'generalManagerSince', 'shareholderSince', 'soleProprietorSince', 'coEntrepreneurSince', 'qualificationFz', 'qualificationKmui'];


  constructor(private readonly employeeService: EmployeeService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly confirmationService: ConfirmationService,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadColHeaders();
    this.selectedColumns = this.cols;
    this.selectedFilterColumns = this.filterCols;

    this.employees = this.employeeService.getEmployees();
    this.loading = false;

    this.customer = 'Joe Doe'


    this.userEmployeeOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userEmployeeOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });




    this.selectedColumns = this.cols;
    this.selectedFilterColumns = this.filterCols;
  }

  loadColHeaders(): void {

    this.customerLabel = this.translate.instant(_('COMMON.CUSTOMER_NAME'));

    this.cols = [
      { field: 'id', header: this.translate.instant(_('EMPLOYEES.TABLE.EMPLOYEE_ID')) },
      { field: 'firstName', header: this.translate.instant(_('EMPLOYEES.TABLE.FIRST_NAME')) },
      { field: 'lastName', header: this.translate.instant(_('EMPLOYEES.TABLE.LAST_NAME')) },
      { field: 'email', header: this.translate.instant(_('EMPLOYEES.TABLE.EMAIL')) },
      { field: 'generalManagerSince', header: this.translate.instant(_('EMPLOYEES.TABLE.GM_SINCE_DATE')) },
      { field: 'shareholderSince', header: this.translate.instant(_('EMPLOYEES.TABLE.SH_SINCE_DATE')) },
      { field: 'soleProprietorSince', header: this.translate.instant(_('EMPLOYEES.TABLE.SP_SINCE_DATE')) },
      { field: 'coEntrepreneurSince', header: this.translate.instant(_('EMPLOYEES.TABLE.CE_SINCE_DATE')) },
      { field: 'qualificationFz', header: this.translate.instant(_('EMPLOYEES.TABLE.QUALI_FZ')) },
      { field: 'qualificationKmui', header: this.translate.instant(_('EMPLOYEES.TABLE.QUALI_MKUI')) },

    ];

    //Filter colums
    this.filterCols = [
      { field: 'id', header: 'Pers. Nr.' },
      { field: 'firstName', header: 'Vorname' },
      { field: 'lastName', header: 'Nachname' },
      { field: 'email', header: 'Email' }
    ];

  }

  onUserEmployeeOverviewPreferencesChanges(userEmployeeOverviewPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userEmployeeOverviewPreferences));
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }


  goToEmployeeDetails(currentEmployee: Employee) {
    this.router.navigate(['employee-details'], { 
      relativeTo: this.route,
      state: { customer: "Joe Doe", employee: currentEmployee } 
    });
  }

  redirectToEmployeeDetails() {
    this.router.navigate(['employee-details'], { 
      relativeTo: this.route,
      state: { customer: "Joe Doe", employee: {} } 
    });
  }

  searchEmployee(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement?.value) {
      this.dt2.filterGlobal(inputElement.value, 'contains');
    }
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  deleteEmployee(employee: number) {
    this.confirmationService.confirm({
      message: this.translate.instant(_('DIALOG.DELETE'), { value: employee }),
      header: this.translate.instant(_('DIALOG.CONFIRM_TITLE')),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant(_('DIALOG.ACCEPT_LABEL')),
      rejectLabel: this.translate.instant(_('DIALOG.REJECT_LABEL')),
      accept: () => {
        this.employeeService.deleteEmployee(employee);
        this.employees = this.employees.filter(
          (val) => val.id !== employee
        );
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant(_('DIALOG.SUCCESSFUL_MESSAGE')),
          detail: this.translate.instant(_('DIALOG.EMPLOYEE_SUCCESS_DELETED_MESSAGE')),
          life: 3000
        });
      },
    });
  }
}
