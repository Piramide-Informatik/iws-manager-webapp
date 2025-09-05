import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { SalutationUtils } from '../../../../master-data/components/salutation/utils/salutation.utils';
import { TitleUtils } from '../../../../master-data/components/title/utils/title-utils';
import { QualificationFZUtils } from '../../../../master-data/components/employee-qualification/utils/qualificationfz-util';
import { Employee } from '../../../../../Entities/employee';
import { EmployeeUtils } from '../../../utils/employee.utils';
import { momentCreateDate, momentFormatDate } from '../../../../shared/utils/moment-date-utils';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';
import { InputNumber } from 'primeng/inputnumber';
import { OccError, OccErrorType } from '../../../../shared/utils/occ-error';

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
  private readonly subscriptions = new Subscription();

  public employeeForm!: FormGroup;
  public formType: 'create' | 'update' = 'create';
  public currentEmployee: Employee | undefined;
  public showOCCErrorModaEmployee = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public occRoute = "";
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

  @ViewChild('inputNumber') firstInput!: InputNumber;

  constructor(private readonly commonMessageService: CommonMessagesService) { }

  ngOnInit(): void {
    this.initForm();
    this.firstInputFocus();
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

  private firstInputFocus(): void {
    setTimeout(() => {
      if (this.firstInput.input.nativeElement) {
        this.firstInput.input.nativeElement.focus();
      }
    }, 300)
  }

  private initForm(): void {
    this.employeeForm = new FormGroup({
      employeeNumber: new FormControl(null),
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

  private buildEmployeeData(customerSource: any): Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
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
    this.isLoading = true;
    this.subscriptions.add(
      this.employeeUtils.createNewEmployee(newEmployee).subscribe({
        next: (createdEmployee) => {
          this.isLoading = false;
          this.commonMessageService.showCreatedSuccesfullMessage();
          setTimeout(() => {
            this.resetFormAndNavigation(createdEmployee.id);
          }, 2000)
        },
        error: (err) => {
          this.isLoading = false;
          console.error('Error creating employee:', err);
          this.commonMessageService.showErrorCreatedMessage();
        }
      })
    );
  }

  private updateEmployee(updatedEmployee: Employee): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.employeeUtils.updateEmployee(updatedEmployee).subscribe({
        next: (editeEmployee) => {
          this.isLoading = false;
          this.commonMessageService.showEditSucessfullMessage();
          this.currentEmployee = editeEmployee;
          this.buildUpdatedEmployee();
        },
        error: (err) => {
          this.isLoading = false;
          this.handleUpdateEmployeeError(err)
        }
      })
    );
  }

  onEmployeeDeleteConfirm() {
    this.isLoading = true;
    if (this.currentEmployee?.id) {
      this.employeeUtils.deleteEmployee(this.currentEmployee.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.visibleEmployeeModalDelete = false;
          this.commonMessageService.showDeleteSucessfullMessage();
          this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Failed to delete employee:', error.message);
          if (error.message.includes('Cannot be deleted because have associated employment contracts')) {
            this.commonMessageService.showErrorDeleteMessageContainsOtherEntities();
          }else if (error instanceof OccError  || error?.message?.includes('404') || error?.errorType === 'DELETE_UNEXISTED') {
            this.showOCCErrorModaEmployee = true;
            this.occErrorType = 'DELETE_UNEXISTED';
            this.visibleEmployeeModalDelete = false;
            this.occRoute = "/customers/employees/" + this.currentEmployee?.customer?.id;
            return;
          } else {
            this.commonMessageService.showErrorDeleteMessage();
          }
        }
      });
    }
  }

  private handleUpdateEmployeeError(error: any): void {

    if (error instanceof OccError) {
      this.showOCCErrorModaEmployee = true;
      this.occErrorType = error.errorType;
      if(this.occErrorType === 'UPDATE_UNEXISTED'){
        this.occRoute = "/customers/employees/" + this.currentEmployee?.customer?.id;
      }
    }
  }

  private resetFormAndNavigation(id: number): void {
    this.clearForm();
    this.router.navigate(['.', id], { relativeTo: this.activatedRoute });
  }

  goBack(): void {
    const path = this.formType === 'update' ? ['../../'] : ['../'];
    this.router.navigate(path, { relativeTo: this.activatedRoute });
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