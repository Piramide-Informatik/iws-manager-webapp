import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Employee } from '../../../../Entities/employee';
import { EmployeeUtils } from '../../utils/employee.utils';
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
  public customerId: number | null = null;
  employees: Employee[] = [];
  selectedCustomers!: WorkContract[] | null;
  selectedCustomer!: WorkContract[] | null;
  submitted: boolean = true;
  statuses!: any[];
  @ViewChild('dt2') dt2!: Table;
  loading: boolean = true;
  public cols!: Column[];
  private langSubscription!: Subscription;
  private employeeSubscription!: Subscription;

  public selectedColumns!: Column[];
  public filterCols!: Column[];
  public selectedFilterColumns!: Column[];
  userEmployeeOverviewPreferences: UserPreference = {};
  tableKey: string = 'EmployeeOverview'
  dataKeys = ['id', 'firstname', 'lastname', 'email', 'generalmanagersince', 'shareholdersince', 'soleproprietorsince', 'coentrepreneursince', 'qualificationFZ', 'qualificationkmui'];


  constructor(private readonly employesService: EmployeeUtils,
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

    // Verificar si hay un customerId en los parámetros de la ruta
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.customerId = +params['id'];
        this.loadEmployeesByCustomer(this.customerId);
      } else {
        this.loadAllEmployees();
      }
    });

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
      { field: 'id', header: this.translate.instant(_('EMPLOYEE.TABLE.EMPLOYEE_ID')) },
      { field: 'firstname', header: this.translate.instant(_('EMPLOYEE.TABLE.FIRST_NAME')) },
      { field: 'lastname', header: this.translate.instant(_('EMPLOYEE.TABLE.LAST_NAME')) },
      { field: 'email', header: this.translate.instant(_('EMPLOYEE.TABLE.EMAIL')) },
      { field: 'generalmanagersince', header: this.translate.instant(_('EMPLOYEE.TABLE.GM_SINCE_DATE')) },
      { field: 'shareholdersince', header: this.translate.instant(_('EMPLOYEE.TABLE.SH_SINCE_DATE')) },
      { field: 'soleproprietorsince', header: this.translate.instant(_('EMPLOYEE.TABLE.SP_SINCE_DATE')) },
      { field: 'coentrepreneursince', header: this.translate.instant(_('EMPLOYEE.TABLE.CE_SINCE_DATE')) },
      { field: 'qualificationFZ', header: this.translate.instant(_('EMPLOYEE.TABLE.QUALI_FZ')) },
      { field: 'qualificationkmui', header: this.translate.instant(_('EMPLOYEE.TABLE.QUALI_MKUI')) },

    ];

    //Filter colums
    this.filterCols = [
      { field: 'id', header: 'Pers. Nr.' },
      { field: 'firstname', header: 'Vorname' },
      { field: 'lastname', header: 'Nachname' },
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
    if (this.employeeSubscription) {
      this.employeeSubscription.unsubscribe();
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
        this.employesService.deleteEmployee(employee).subscribe({
          next: () => {
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
          error: (error) => {
            console.error('Error deleting employee:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete employee',
              life: 3000
            });
          }
        });
      },
    });
  }

  private loadAllEmployees(): void {
    this.employeeSubscription = this.employesService.getAllEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading = false;
        this.employees = [];
      }
    });
  }

  private loadEmployeesByCustomer(customerId: number): void {
    this.employeeSubscription = this.employesService.getEmployeesByCustomerId(customerId).subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading employees by customer:', error);
        this.loading = false;
        this.employees = [];
      }
    });
  }
}
