import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserPreference } from '../../../../Entities/user-preference';
import { Column } from '../../../../Entities/column';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../../Entities/project';
import { ProjectStateService } from '../../utils/project-state.service';
import { ProjectUtils } from '../../../customer/sub-modules/projects/utils/project.utils';
import { EmployeeDetailModalComponent } from './components/employee-detail-modal/employee-detail-modal.component';
import { OrderEmployeeUtils } from '../../utils/order-employee.util';
import { OrderEmployee } from '../../../../Entities/orderEmployee';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { Title } from '@angular/platform-browser';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';

@Component({
  selector: 'app-employee-project',
  standalone: false,
  templateUrl: './employee-project.component.html',
  styleUrl: './employee-project.component.scss'
})
export class EmployeeProjectComponent implements OnInit, OnDestroy {
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly orderEmployeeUtils = inject(OrderEmployeeUtils);
  private readonly projectStateService = inject(ProjectStateService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly commonMessageService = inject(CommonMessagesService);
  visibleModal: boolean = false;
  modalType: 'create' | 'edit' | 'delete' = 'create';
  @ViewChild('employeeDetailModal') employeeDetailModalDialog!: EmployeeDetailModalComponent;
  selectedEmployeeDetails: OrderEmployee | null = null;
  isCreateButtonEnable = true;
  employeeNo: number | null = null;

  visibleModalNewEmployee = false;
  public occErrorEmployeeDetailType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalEmployeeDetail = false;

  projectEmployees: OrderEmployee[] = [];
  currentProject!: Project | null;
  currentProjectId!: number;

  public cols!: Column[];
  public selectedColumns!: Column[];
  tableKey: string = 'EmployeeProjectOverview';
  dataKeys = ['employeeno', 'firstname', 'lastname', 'hourlyRate', 'qualificationkmui'];
  userProjectEmployeesPreferences: UserPreference = {};
  private langSubscription!: Subscription;
  private readonly subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    const routeSub = this.route.params.subscribe(params => {
      this.currentProjectId = Number(params['idProject']);
      this.loadProject();
      this.loadEmployees()
    });
    this.subscriptions.add(routeSub);

    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.userProjectEmployeesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.titleService.setTitle(`${this.translate.instant('PAGETITLE.PROJECT.PROJECT_EMPLOYEE')}`);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.titleService.setTitle(`${this.translate.instant('PAGETITLE.PROJECT.PROJECT_EMPLOYEE')}`);
      this.userProjectEmployeesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

  }

  private loadProject(): void {
    const projectSub = this.projectStateService.currentProject$.subscribe(project => {
      if (project && project.id === this.currentProjectId) {
        this.currentProject = project;
      } else {
        this.projectUtils.getProjectById(this.currentProjectId).subscribe(proj => {
          if (proj) {
            this.currentProject = proj;
            this.projectStateService.setProjectToEdit(proj);
          }
        })
      }
    });
    this.subscriptions.add(projectSub);
  }

  private loadEmployees(): void {
    this.orderEmployeeUtils.getAllOrderEmployeeByProject(this.currentProjectId).subscribe(orderEmployees => {
      this.projectEmployees = orderEmployees
    })
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'employee.employeeno', classesTHead: ['width-10'], header: this.translate.instant('EMPLOYEE.TABLE.EMPLOYEE_ID') },
      { field: 'employee.firstname', classesTHead: ['width-20'], header: this.translate.instant('EMPLOYEE.TABLE.FIRST_NAME') },
      { field: 'employee.lastname', classesTHead: ['width-20'], header: this.translate.instant('EMPLOYEE.TABLE.LAST_NAME') },
      { field: 'hourlyrate', classesTHead: ['width-10'], type: 'double', filter: { type: 'numeric' }, customClasses: ['align-right'], header: this.translate.instant('EMPLOYEE-CONTRACTS.TABLE.HOURLY_RATE') },
      { field: 'qualificationkmui', classesTHead: ['width-40'], header: this.translate.instant('PROJECT_EMPLOYEES.TABLE.FZ_ABBREVIATION_R&H_ACTIVITY') },
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  onUserProjectEmployeePreferencesChanges(userProjectEmployeePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userProjectEmployeePreferences));
  }

  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
    this.subscriptions.unsubscribe();
  }
  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedEmployeeDetails = null;
    }
  }

  onCloseModal() {
    if (this.employeeDetailModalDialog) {
      this.employeeDetailModalDialog.onCancel();
    }
    this.visibleModal = false;
    this.selectedEmployeeDetails = null;
  }

  onNewEmployeeClick(): void {
    this.modalType = 'create';
    this.visibleModal = true;
    this.selectedEmployeeDetails = null;
  }

  handleTableEvents(event: { type: 'new employee' | 'create' | 'edit' | 'delete', data?: any }): void {
    if (event.type === 'new employee') {
      this.visibleModalNewEmployee = true;
    } else {
      this.modalType = event.type;
      if (event.type === 'edit' && event.data) {
        this.selectedEmployeeDetails = event.data;
        this.employeeNo = this.selectedEmployeeDetails?.employee?.employeeno ?? null;
      }
      if (event.type === 'delete' && event.data) {
        // event.data is the OrderEmployee ID, find the full object
        const foundEmployee = this.projectEmployees.find(e => e.id === event.data);
        if (foundEmployee) {
          this.selectedEmployeeDetails = foundEmployee;
          this.employeeNo = foundEmployee.employee?.employeeno ?? null;
        }
      }
      this.visibleModal = true;
    }
  }
  onDeleteEmployee(event: { status: 'success' | 'error', error?: Error }): void {
    if (event.status === 'success') {
      // Reload the employees list using the same method as initial load
      this.loadEmployees();
      this.commonMessageService.showDeleteSucessfullMessage();
    } else if (event.status === 'error' && event.error) {
      if (event.error instanceof OccError || event.error?.message.includes('404')) {
        this.showOCCErrorModalEmployeeDetail = true;
        this.occErrorEmployeeDetailType = 'DELETE_UNEXISTED';
      }else{
        this.commonMessageService.showErrorDeleteMessage();
      }
    }
  }

  createdOrderEmployee(event: { status: 'success' | 'error', error?: any }): void {
    if(event.status === 'success') {
      this.loadEmployees();
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error' && event.error){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  updatedOrderEmployee(event: { status: 'success' | 'error', error?: any }): void {
    if(event.status === 'success'){
      this.loadEmployees();
      this.commonMessageService.showEditSucessfullMessage();
    }else if(event.status === 'error' && event.error){
      if (event.error instanceof OccError) {
        this.showOCCErrorModalEmployeeDetail = true;
        this.occErrorEmployeeDetailType = event.error.errorType;
      }else{
        this.commonMessageService.showErrorEditMessage();
      }
    }
  }

  onCreatedNewEmployee(): void {
    this.employeeDetailModalDialog.loadEmployees();
  }
}
