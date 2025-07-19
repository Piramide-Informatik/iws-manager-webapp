import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { SalutationUtils } from '../../../../master-data/components/salutation/utils/salutation.utils';
import { TitleUtils } from '../../../../master-data/components/title/utils/title-utils';
import { QualificationFZUtils } from '../../../../master-data/components/employee-qualification/utils/qualificationfz-util';
import { Employee } from '../../../../../Entities/employee';
import { EmployeeUtils } from '../../../utils/employee.utils';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { momentCreateDate, momentFormatDate } from '../../../../shared/utils/moment-date-utils';
import { MESSAGE } from '../../../../../general-models/messages';

@Component({
  selector: 'app-employee-form',
  standalone: false,
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent implements OnInit, OnDestroy {
  private readonly employeeUtils = inject(EmployeeUtils);
  private readonly salutationUtils = inject(SalutationUtils);
  private readonly titleUtils = inject(TitleUtils);
  private readonly qualificationFZUtils = inject(QualificationFZUtils);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly subscriptions = new Subscription();

  public employeeForm!: FormGroup;
  public formType: 'create' | 'update' = 'create';
  public currentEmployee: Employee | undefined;
  public id = 0;
  public showOCCErrorModaEmployee = false;
  // Modal delete
  public visibleEmployeeModalDelete: boolean = false;
  public isLoading = false;

  public salutations = toSignal(
    this.salutationUtils.getSalutationsSortedByName().pipe(
      map(s => s.map(({ name, id }) => ({ name, id })))
    ),
    { initialValue: [] }
  );

  public titles = toSignal(
    this.titleUtils.getTitlesSortedByName().pipe(
      map(t => t.map(({ name, id }) => ({ name, id })))
    ),
    { initialValue: [] }
  );

  public qualificationsFZ = toSignal(
    this.qualificationFZUtils.getAllQualifications().pipe(
      map(q => q.map(({ qualification, id }) => ({ name: qualification, id })))
    ),
    { initialValue: [] }
  );

  constructor() { }

  ngOnInit(): void {
    this.initForm();

    this.activatedRoute.params.subscribe(params => {
      const employeeId = params['employeeId'];
      if (!employeeId) {
        this.formType = 'create';
      } else {
        this.formType = 'update';
        this.subscriptions.add(
          this.employeeUtils.getEmployeeById(employeeId).subscribe({
            next: (employee) => {
              if (employee) {
                this.currentEmployee = employee;
                this.employeeForm.patchValue({
                  employeeNumber: employee.employeeno,
                  salutation: employee.salutation?.id,
                  title: employee.title?.id,
                  employeeFirstName: employee.firstname,
                  employeeLastName: employee.lastname,
                  employeeEmail: employee.email,
                  generalManagerSinceDate: momentCreateDate(employee.generalmanagersince),
                  shareholderSinceDate: momentCreateDate(employee.shareholdersince),
                  solePropietorSinceDate: momentCreateDate(employee.soleproprietorsince),
                  coentrepreneurSinceDate: momentCreateDate(employee.coentrepreneursince),
                  qualificationFzId: employee.qualificationFZ?.id ?? '',
                  qualificationKMUi: employee.qualificationkmui ?? ''
                });
              }
            },
            error: (err) => console.error('Error loading employee:', err)
          })
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.employeeForm = new FormGroup({
      employeeNumber: new FormControl(''),
      salutation: new FormControl(''),
      title: new FormControl(''),
      employeeFirstName: new FormControl(''),
      employeeLastName: new FormControl(''),
      employeeEmail: new FormControl(''),
      generalManagerSinceDate: new FormControl(''),
      shareholderSinceDate: new FormControl(''),
      solePropietorSinceDate: new FormControl(''),
      coentrepreneurSinceDate: new FormControl(''),
      qualificationFzId: new FormControl(''),
      qualificationKMUi: new FormControl('')
    });
  }

  onSubmit(): void {
    if (this.employeeForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    const employee = this.formType === 'create'
      ? this.buildEmployeeFromForm()
      : this.buildUpdatedEmployee();

    if (this.formType === 'create') {
      this.createEmployee(employee);
    } else {
      this.updateEmployee(employee as Employee);
    }
  }

  private buildEmployeeData(customerSource: any): Omit<Employee, 'id' | 'createdAt' | 'updatedAt'| 'version'> {
    const formValues = this.employeeForm.value;

    return {
      customer: this.buildCustomerFromSource(customerSource),
      employeeno: formValues.employeeNumber,
      salutation: this.mapIdToEntity(formValues.salutation),
      title: this.mapIdToEntity(formValues.title),
      firstname: formValues.employeeFirstName,
      lastname: formValues.employeeLastName,
      email: formValues.employeeEmail,
      label: '',
      phone: '',
      generalmanagersince: momentFormatDate(formValues.generalManagerSinceDate),
      shareholdersince: momentFormatDate(formValues.shareholderSinceDate),
      soleproprietorsince: momentFormatDate(formValues.solePropietorSinceDate),
      coentrepreneursince: momentFormatDate(formValues.coentrepreneurSinceDate),
      qualificationFZ: this.mapQualificationFZIdToEntity(formValues.qualificationFzId),
      qualificationkmui: formValues.qualificationKMUi,
    };
  }

  private buildEmployeeFromForm(): Omit<Employee, 'id'> {
    const employee = this.buildEmployeeData(history.state.customer);
    return {
      ...employee,
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private buildUpdatedEmployee(): Employee {
    return {
      ...this.currentEmployee!,
      ...this.buildEmployeeData(this.currentEmployee?.customer)
    };
  }

  private buildCustomerFromSource(source: any): any {
    return {
      id: source?.id ?? 0,
      version: 0,
      createdAt: '',
      updatedAt: '',
      branch: {
        id: source?.branch?.id ?? 0,
        name: '',
        version: 0
      },
      companytype: {
        id: source?.companytype?.id ?? 0,
        createdAt: '',
        updatedAt: '',
        name: '',
        version: 0
      },
      country: {
        id: source?.country?.id ?? 0,
        name: '',
        label: '',
        isDefault: source?.country?.isDefault ?? false,
        createdAt: '',
        updatedAt: '',
        version: 0
      },
      state: {
        id: source?.state?.id ?? 0,
        name: '',
        createdAt: '',
        updatedAt: '',
        version: 0
      }
    };
  }

  private mapIdToEntity(id: number | null): any {
    return id ? { id, name: '', createdAt: '', updatedAt: '', version: 0 } : null;
  }

  private mapQualificationFZIdToEntity(id: number | null): any {
    return id ? { id, qualification: '', createdAt: '', updatedAt: '', version: 0 } : null;
  }

  private createEmployee(newEmployee: Omit<Employee, 'id'>): void {
    this.subscriptions.add(
      this.employeeUtils.createNewEmployee(newEmployee).subscribe({
        next: (createdEmployee) => {
          this.handleMessages(MESSAGE.severity.success, MESSAGE.summary.SUCCESS, MESSAGE.detail.CREATE_SUCCESS);
          setTimeout(()=>{
            this.resetFormAndNavigation(createdEmployee.id);
          },2000)
        },
        error: (err) => {
          console.error('Error creating employee:', err);
          this.handleMessages(MESSAGE.severity.error, MESSAGE.summary.ERROR, MESSAGE.detail.CREATE_FAILED);
        }
      })
    );
  }

  private updateEmployee(updatedEmployee: Employee): void {
    this.subscriptions.add(
      this.employeeUtils.updateEmployee(updatedEmployee).subscribe({
        next: () => this.handleMessages(MESSAGE.severity.success,MESSAGE.summary.SUCCESS,MESSAGE.detail.UPDATE_SUCCESS),
        error: (err) => this.handleUpdateEmployeeError(err)
      })
    );
  }

  onEmployeeDeleteConfirm() {
    this.isLoading = true;
    if(this.currentEmployee?.id){
      this.employeeUtils.deleteEmployee(this.currentEmployee.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.visibleEmployeeModalDelete = false;
          this.handleMessages(MESSAGE.severity.success, MESSAGE.summary.SUCCESS, MESSAGE.detail.DELETE_SUCCESS);
          setTimeout(()=>{
            this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
          },2000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Failed to delete employee:', error.message);
          if(error.message.includes('Canot be deleted because have associated employement contracts')){
            this.handleMessages(MESSAGE.severity.error, MESSAGE.summary.ERROR, MESSAGE.detail.DELETE_ERROR_WITH_RECORDS);
          }else{
            this.handleMessages(MESSAGE.severity.error, MESSAGE.summary.ERROR, MESSAGE.detail.DELETE_FAILED);
          }
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

  private handleUpdateEmployeeError(err: any): void {
    if (err.message === 'Conflict detected: employee person version mismatch') {
      this.showOCCErrorModaEmployee = true;
    }
  }

  private resetFormAndNavigation(id: number): void {
    this.clearForm();
    this.router.navigate(['.', id], { relativeTo: this.activatedRoute });
  }

  goBack(): void {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  clearForm(): void {
    this.employeeForm.reset();
  }

  showModalDelete(): void {
    this.visibleEmployeeModalDelete = true;
  }

  public getFullNameEmployee(): string {
    return `${this.currentEmployee?.firstname} ${this.currentEmployee?.lastname}`.trim();
  }
}