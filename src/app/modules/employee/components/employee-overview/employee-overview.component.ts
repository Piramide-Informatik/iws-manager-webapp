import { Component, OnDestroy, OnInit, ViewChild, computed } from '@angular/core';
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

@Component({
  selector: 'app-employee-overview',
  standalone: false,
  templateUrl: './employee-overview.component.html',
  styleUrl: './employee-overview.component.scss'
})
export class EmployeeOverviewComponent implements OnInit, OnDestroy {
  readonly employeeListData = computed(() => {
    return this.employeeUtils.getEmployeesSignal()()
  });

  // Route and customer properties
  public customerId: number | null = null;
  
  // Data properties
  employees: Employee[] = [];
  loading: boolean = true;
  
  // Table configuration
  @ViewChild('dt2') dt2!: Table;
  public cols!: Column[];
  public selectedColumns!: Column[];
  public filterCols!: Column[];
  public selectedFilterColumns!: Column[];
  userEmployeeOverviewPreferences: UserPreference = {};
  tableKey: string = 'EmployeeOverview'
  dataKeys = ['id', 'firstname', 'lastname', 'email', 'generalmanagersince', 'shareholdersince', 'soleproprietorsince', 'coentrepreneursince', 'qualificationFZ', 'qualificationkmui'];
  
  // Modal properties for delete confirmation
  employeeType: 'create' | 'delete' = 'create';
  selectedEmployee: number | null = null;
  employeeName: string = '';
  visibleEmployeeModal: boolean = false;
  isLoading = false;
  errorMessage: string = '';

  // Subscriptions
  private langSubscription!: Subscription;
  private employeeSubscription!: Subscription;


  constructor(
    private readonly employeeUtils: EmployeeUtils,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadColHeaders();
    this.selectedColumns = this.cols;
    this.selectedFilterColumns = this.filterCols;

    // Load employees based on route parameters
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.customerId = +params['id'];
        this.loadEmployeesByCustomer(this.customerId);
      } else {
        this.loadAllEmployees();
      }
    });

    // Setup user preferences and language subscription
    this.userEmployeeOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userEmployeeOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  handleEmployeeTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.employeeType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedEmployee = event.data;

      this.employeeUtils.getEmployeeById(this.selectedEmployee!).subscribe({
        next: (employee) => {
          this.employeeName = `${employee?.firstname ?? ''} ${employee?.lastname ?? ''}`.trim();
        },
        error: (err) => {
          console.error('No se pudo obtener el empleado:', err);
          this.employeeName = '';
        }
      });
    }
    this.visibleEmployeeModal = true;
  }

  loadColHeaders(): void {
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

    // Filter columns
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
      state: { employee: currentEmployee } 
    });
  }

  redirectToEmployeeDetails() {
    this.router.navigate(['employee-details'], { 
      relativeTo: this.route,
      state: { employee: {} } 
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

  private loadAllEmployees(): void {
    this.employeeSubscription = this.employeeUtils.getAllEmployees().subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees;
        this.employeeUtils.updateEmployeeData(employees); 
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading employees:', error);
        this.loading = false;
        this.employees = [];
        this.employeeUtils.updateEmployeeData([]); 
      }
    });
  }

  private loadEmployeesByCustomer(customerId: number): void {
    this.employeeSubscription = this.employeeUtils.getEmployeesByCustomerId(customerId).subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees;
        this.employeeUtils.updateEmployeeData(employees); 
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading employees by customer:', error);
        this.loading = false;
        this.employees = [];
        this.employeeUtils.updateEmployeeData([]); 
      }
    });
  }

  onEmployeeDeleteConfirm() {
    this.isLoading = true;
    if(this.selectedEmployee){
      this.employeeUtils.deleteEmployee(this.selectedEmployee).subscribe({
        next: () => {
          this.isLoading = false;
          this.visibleEmployeeModal = false;
          
          // Actualizar la lista local inmediatamente
          this.employees = this.employees.filter(emp => emp.id !== this.selectedEmployee);
          
          // También actualizar el servicio para mantener consistencia con el estado reactivo
          this.employeeUtils.updateEmployeeData(this.employees);
          
          // Limpiar la selección
          this.selectedEmployee = null;
          this.employeeName = '';
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
