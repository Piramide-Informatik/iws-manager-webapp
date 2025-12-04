import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ProjectEmployee } from '../../../../Entities/projectEmployee';
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

@Component({
  selector: 'app-employee-project',
  standalone: false,
  templateUrl: './employee-project.component.html',
  styleUrl: './employee-project.component.scss'
})
export class EmployeeProjectComponent implements OnInit, OnDestroy {
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly projectStateService = inject(ProjectStateService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  visibleModal: boolean = false;
  modalType: 'create' | 'edit' | 'delete' = 'create';
  selectedEmployeeDetails: ProjectEmployee | null = null;
  isCreateButtonEnable = true;

   @ViewChild('employeeDetailModal') employeeDetailModalDialog!: EmployeeDetailModalComponent;

  projectEmployees: ProjectEmployee[] = [];
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
    });
    this.subscriptions.add(routeSub);
    
    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.userProjectEmployeesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userProjectEmployeesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

  }

  private loadProject(): void {
    const projectSub = this.projectStateService.currentProject$.subscribe(project => {
      if(project && project.id === this.currentProjectId) {
        this.currentProject = project;
      }else{
        this.projectUtils.getProjectById(this.currentProjectId).subscribe(proj => {
          if(proj){
            this.currentProject = proj;
            this.projectStateService.setProjectToEdit(proj);
          }
        })
      }
    });
    this.subscriptions.add(projectSub);
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'employee.employeeno', header: this.translate.instant('EMPLOYEE.TABLE.EMPLOYEE_ID') },
      { field: 'employee.firstname', header: this.translate.instant('EMPLOYEE.TABLE.FIRST_NAME') },
      { field: 'employee.lastname', header: this.translate.instant('EMPLOYEE.TABLE.LAST_NAME') },
      { field: 'hourlyRate', type: 'double', filter: { type: 'numeric' }, customClasses: ['align-right'], header: this.translate.instant('EMPLOYEE-CONTRACTS.TABLE.HOURLY_RATE') },
      { field: 'qualificationkmui', header: this.translate.instant('PROJECT_EMPLOYEES.TABLE.FZ_ABBREVIATION_R&H_ACTIVITY') },
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

  handleTableEvents(event: { type: 'create' | 'edit' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'edit') {
      //code to edit
    }
    if (event.type === 'delete') {
      //code to delete
    }
    this.visibleModal = true;
  }
}
