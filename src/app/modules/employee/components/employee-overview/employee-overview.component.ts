import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Employee } from '../../../../Entities/employee';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { EmployeeUtils } from '../../utils/employee.utils';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { Customer } from '../../../../Entities/customer';
import { MESSAGE } from '../../../../general-models/messages';


interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  routerLink?: (row: any) => string;
  type?: string;
  customClasses?: string[];
}

@Component({
  selector: 'app-employee-overview',
  standalone: false,
  providers: [MessageService],
  templateUrl: './employee-overview.component.html',
  styleUrl: './employee-overview.component.scss'
})
export class EmployeeOverviewComponent implements OnInit, OnDestroy {
  private readonly employeeUtils = inject(EmployeeUtils);
  private readonly customerUtils = inject(CustomerUtils);
  public customer!: Customer | undefined;
  employees: Employee[] = [];
  @ViewChild('dt2') dt2!: Table;
  public cols!: Column[];
  private langSubscription!: Subscription;

  public selectedColumns!: Column[];
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

  constructor(
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.userEmployeeOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userEmployeeOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.route.params.subscribe(params => {
      this.customerUtils.getCustomerById(params['id']).subscribe(customer => {
        this.customer = customer; 
      });

      this.employeeUtils.getAllEmployeesByCustomerId(params['id']).subscribe( employees => {
        this.employees = employees;
      })
    })

    this.selectedColumns = this.cols;
  }

  loadColHeaders(): void {
    this.cols = [
      { 
        field: 'employeeno',
        routerLink: (row: any) => `./employee-details/${row.id}`,
        header: this.translate.instant(_('EMPLOYEE.TABLE.EMPLOYEE_ID')),
        customClasses: ['align-right']
      },
      { field: 'firstname', header: this.translate.instant(_('EMPLOYEE.TABLE.FIRST_NAME')) },
      { field: 'lastname', header: this.translate.instant(_('EMPLOYEE.TABLE.LAST_NAME')) },
      { field: 'email', header: this.translate.instant(_('EMPLOYEE.TABLE.EMAIL')) },
      { field: 'generalmanagersince', type: 'date', header: this.translate.instant(_('EMPLOYEE.TABLE.GM_SINCE_DATE')), customClasses: ['align-right'] },
      { field: 'shareholdersince',  type: 'date', header: this.translate.instant(_('EMPLOYEE.TABLE.SH_SINCE_DATE')), customClasses: ['align-right'] },
      { field: 'soleproprietorsince',  type: 'date', header: this.translate.instant(_('EMPLOYEE.TABLE.SP_SINCE_DATE')), customClasses: ['align-right'] },
      { field: 'coentrepreneursince',  type: 'date', header: this.translate.instant(_('EMPLOYEE.TABLE.CE_SINCE_DATE')), customClasses: ['align-right'] },
      { field: 'qualificationFZ.qualification', header: this.translate.instant(_('EMPLOYEE.TABLE.QUALI_FZ')) },
      { field: 'qualificationkmui', header: this.translate.instant(_('EMPLOYEE.TABLE.QUALI_MKUI')) },

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
    this.router.navigate(['employee-details', currentEmployee.id], { 
      relativeTo: this.route,
      state: { customer: this.customer, employee: currentEmployee } 
    });
  }

  redirectToEmployeeDetails() {
    this.router.navigate(['employee-details'], { 
      relativeTo: this.route,
      state: { customer: this.customer, employee: {} } 
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

        const firstName = localEmployee.firstname ?? (localEmployee as any).firstname ?? '';
        const lastName = localEmployee.lastname ?? (localEmployee as any).lastname ?? '';
        
        this.employeeName = `${firstName} ${lastName}`.trim();
        this.visibleEmployeeModal = true;
      } else {
        this.employeeUtils.getEmployeeById(this.selectedEmployee!).subscribe({
          next: (employee) => {
            
            const firstName = employee?.firstname ?? (employee as any)?.firstname ?? '';
            const lastName = employee?.lastname ?? (employee as any)?.lastname ?? '';
            
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
          this.handleMessages(MESSAGE.severity.success, MESSAGE.summary.SUCCESS, MESSAGE.detail.DELETE_SUCCESS);
          this.route.params.subscribe(params => {
            this.employeeUtils.getAllEmployeesByCustomerId(params['id']).subscribe( employees => {
             this.employees = employees;
            })
          })
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message ?? 'Failed to delete employee';
          this.handleMessages(MESSAGE.severity.error, MESSAGE.summary.ERROR, MESSAGE.detail.DELETE_FAILED);
          console.error('Delete error:', error);
        }
      });
    }
  }

  private handleMessages(severity: string, summary: string, detail: string): void {
    this.messageService.add({
      severity,
      summary: this.translate.instant(summary),
      detail: this.translate.instant(detail)
    });
  }
}
