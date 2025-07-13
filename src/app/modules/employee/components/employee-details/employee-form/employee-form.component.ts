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
  private readonly route = inject(ActivatedRoute);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly subscriptions = new Subscription();

  public employeeForm!: FormGroup;
  public formType: 'create' | 'update' = 'create';
  public currentEmployee: Employee | undefined;
  public id = 0;
  public showOCCErrorModaEmployee = false;

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
                  generalManagerSinceDate: employee.generalmanagersince ? new Date(employee.generalmanagersince) : null,
                  shareholderSinceDate: employee.shareholdersince ? new Date(employee.shareholdersince) : null,
                  solePropietorSinceDate: employee.soleproprietorsince ? new Date(employee.soleproprietorsince) : null,
                  coentrepreneurSinceDate: employee.coentrepreneursince ? new Date(employee.coentrepreneursince) : null,
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
      generalmanagersince: this.formatOptionalDate(formValues.generalManagerSinceDate),
      shareholdersince: this.formatOptionalDate(formValues.shareholderSinceDate),
      soleproprietorsince: this.formatOptionalDate(formValues.solePropietorSinceDate),
      coentrepreneursince: this.formatOptionalDate(formValues.coentrepreneurSinceDate),
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

  private formatOptionalDate(date: Date | null): string | undefined {
    return date ? date.toISOString().split('T')[0] : undefined;
  }

  private createEmployee(newEmployee: Omit<Employee, 'id'>): void {
    this.subscriptions.add(
      this.employeeUtils.createNewEmployee(newEmployee).subscribe({
        next: (createdEmployee) => {
          this.handleSuccess();
          this.resetFormAndNavigation(createdEmployee.id);
        },
        error: (err) => this.handleError(err)
      })
    );
  }

  private updateEmployee(updatedEmployee: Employee): void {
    this.subscriptions.add(
      this.employeeUtils.updateEmployee(updatedEmployee).subscribe({
        next: (savedEmployee) => this.handleUpdateEmployeeSuccess(savedEmployee),
        error: (err) => this.handleUpdateEmployeeError(err)
      })
    );
  }

  private handleSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('CUSTOMERS.MESSAGE.SUCCESS'),
      detail: this.translate.instant('CUSTOMERS.MESSAGE.CREATE_SUCCESS')
    });
  }

  private handleError(err: any): void {
    console.error('Error creating employee:', err);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('CUSTOMERS.MESSAGE.ERROR'),
      detail: this.translate.instant('CUSTOMERS.MESSAGE.CREATE_FAILED')
    });
  }

  private handleUpdateEmployeeSuccess(savedEmployee: Employee): void {
    this.showSuccessMessage('TITLE.MESSAGE.UPDATE_SUCCESS');
  }

  private handleUpdateEmployeeError(err: any): void {
    if (err.message === 'Conflict detected: employee person version mismatch') {
      this.showOCCErrorModaEmployee = true;
    }
  }

  private showSuccessMessage(messageKey: string): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('TITLE.MESSAGE.SUCCESS'),
      detail: this.translate.instant(messageKey)
    });
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
}