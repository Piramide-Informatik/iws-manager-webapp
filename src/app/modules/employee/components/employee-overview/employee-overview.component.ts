import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Employee } from '../../../../Entities/employee';
import { EmployeeService } from '../../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { EmployeeUtils } from '../../utils/employee.utils';


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
  private readonly employeeUtils = inject(EmployeeUtils);
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
  dataKeys = ['id', 'firstname', 'lastname', 'email', 'generalmanagersince', 'shareholdersince', 'soleproprietorsince', 'coentrepreneursince', 'qualificationFZ', 'qualificationkmui'];

  // properties for delete modal
  employeeType: 'create' | 'delete' = 'create';
  selectedEmployee: number | null = null;
  employeeName: string = '';
  visibleEmployeeModal: boolean = false;
  isLoading = false;
  errorMessage: string = '';

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

    this.loading = false;

    this.customer = 'Joe Doe'


    this.userEmployeeOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userEmployeeOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.route.params.subscribe(params => {
       this.employeeUtils.getAllEmployeesByCustomerId(params['id']).subscribe( employees => {
        this.employees = employees;
       })
    })

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

  handleEmployeeTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.employeeType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedEmployee = event.data;
      
      const localEmployee = this.employees.find(emp => emp.id === this.selectedEmployee);
      
      if (localEmployee) {

        const firstName = localEmployee.firstName || (localEmployee as any).firstname || '';
        const lastName = localEmployee.lastName || (localEmployee as any).lastname || '';
        
        this.employeeName = `${firstName} ${lastName}`.trim();
        this.visibleEmployeeModal = true;
      } else {
        this.employeeUtils.getEmployeeById(this.selectedEmployee!).subscribe({
          next: (employee) => {
            
            const firstName = employee?.firstName || (employee as any)?.firstname || '';
            const lastName = employee?.lastName || (employee as any)?.lastname || '';
            
            this.employeeName = `${firstName} ${lastName}`.trim();
            this.visibleEmployeeModal = true;
          },
          error: (err) => {
            console.error('Error fetching employee:', err);
            this.employeeName = '';
            this.visibleEmployeeModal = true;
          }
        });
        return;
      }
    }
    
    if (event.type !== 'delete') {
      this.visibleEmployeeModal = true;
    }
  }

  onEmployeeDeleteConfirm() {
    this.isLoading = true;
    if(this.selectedEmployee){
      this.employeeUtils.deleteEmployee(this.selectedEmployee).subscribe({
        next: () => {
          this.isLoading = false;
          this.visibleEmployeeModal = false;
          this.route.params.subscribe(params => {
            this.employeeUtils.getAllEmployeesByCustomerId(params['id']).subscribe( employees => {
             this.employees = employees;
            })
         })
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message ?? 'Failed to delete employee';
          console.error('Delete error:', error);
        }
      });
    }
  }
}
