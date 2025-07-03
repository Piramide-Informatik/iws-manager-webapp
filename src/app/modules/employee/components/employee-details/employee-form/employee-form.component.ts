import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Subscription } from 'rxjs';
import { QualificationFZ } from '../../../models/qualification-fz';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { SalutationUtils } from '../../../../master-data/components/salutation/utils/salutation.utils';
import { TitleUtils } from '../../../../master-data/components/title/utils/title-utils';
import { Employee } from '../../../../../Entities/employee';
import { EmployeeUtils } from '../../../utils/employee.utils';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { SalutationService } from '../../../../../Services/salutation.service';

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

  public showOCCErrorModaEmployee = false;
  private readonly salutationService = inject(SalutationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly subscriptions = new Subscription();

  public employeeForm!: FormGroup;
  formType: 'create' | 'update' = 'create';
  public currentEmployee: Employee | undefined;
  public id = 0;

  qualificationsFZ: QualificationFZ[] | undefined;

  public salutations = toSignal(
    this.salutationUtils.getSalutationsSortedByName().pipe(
      map(salutations => salutations.map(salutation => ({
        name: salutation.name,
        code: salutation.id
      })))
    ),
    { initialValue: [] }
  );
  
  public titles = toSignal(
    this.titleUtils.getTitlesSortedByName().pipe(
      map(titles => titles.map(title => ({
        name: title.name,
        code: title.id
      })))
    ),
    { initialValue: [] }
  );

  constructor() {}

  ngOnInit(): void {
    this.initForm();

    this.activatedRoute.params.subscribe(params => {
      const employeeId = params['employeeId'];
      console.log('params', params)
      if (!employeeId) {
        this.formType = 'create';
      }else {
        this.formType = 'update';
        console.log('state employee', history.state.employee)
        console.log('state customer', history.state.customer)
        this.subscriptions.add(
          this.employeeUtils.getEmployeeById(employeeId).subscribe({
            next: (employee) => {
              if (employee) {
                this.currentEmployee = employee;
                this.employeeForm.patchValue({
                  employeeNumber: employee.employeeno,
                  salutation: employee.salutation?.id ,
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
            error: (err) => {
              console.error('Error loading employee:', err);
            }
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

  onSubmit() {
    if(this.employeeForm.invalid) {
      console.error('Form is invalid');
      return;
    }

    if(this.formType === 'create') {
      const newEmployee = this.buildEmployeeFromForm();
      this.createEmployee(newEmployee);
    } else if(this.formType === 'update') {
      const updatedEmployee = this.buildUpdatedEmployee();
      this.updateEmployee(updatedEmployee);
    }
  }

  private createEmployee(newEmployee: Omit<Employee, 'id'>){
    this.subscriptions.add(
      this.employeeUtils.createNewEmployee(newEmployee).subscribe({
        next: (createdEmployee) => {
          this.handleSuccess()
          this.resetFormAndNavigation(createdEmployee.id);
        },
        error: (err) => this.handleError(err)
      })
    )
  }

  private buildEmployeeFromForm(): Omit<Employee, 'id'> {
    const formValues = this.employeeForm.value;
    return {
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: {
        id: history.state.customer?.id ?? 0, 
        version: 0,
        createdAt: '',
        updatedAt: '',
        branch: {
          id: history.state.customer?.branch?.id ?? 0,
          name: '',
          version: 0
        },
        companytype: {
          id: history.state.customer?.companytype?.id ?? 0,
          createdAt: '',
          updatedAt: '',
          name: '',
          version: 0
        },
        country: {
          id: history.state.customer?.country?.id ?? 0,
          name: '',
          label: '',
          isDefault: history.state.customer?.country?.isDefault ?? false,
          createdAt: '',
          updatedAt: '',
          version: 0
        },
        state: {
          id: history.state.customer?.state?.id ?? 0,
          name: '',
          createdAt: '',
          updatedAt: '',
          version: 0
        }
      },
      employeeno: formValues.employeeNumber,
      salutation: formValues.salutation 
        ? { id: formValues.salutation, name: '', createdAt: '', updatedAt: '', version: 0 }
        : null,
      title: formValues.title 
        ? { id: formValues.title, name: '', createdAt: '', updatedAt: '', version: 0 }
        : null,
      firstname: formValues.employeeFirstName,
      lastname: formValues.employeeLastName,
      email: formValues.employeeEmail,
      label: '',
      phone: '',
      generalmanagersince: formValues.generalManagerSinceDate ? this.formatDate(formValues.generalManagerSinceDate) : undefined,
      shareholdersince: formValues.shareholderSinceDate ? this.formatDate(formValues.shareholderSinceDate) : undefined,
      soleproprietorsince: formValues.solePropietorSinceDate ? this.formatDate(formValues.solePropietorSinceDate) : undefined,
      coentrepreneursince: formValues.coentrepreneurSinceDate ? this.formatDate(formValues.coentrepreneurSinceDate) : undefined,
      qualificationFZ: null,
      qualificationkmui: formValues.qualificationKMUi,
    };
  }

  private buildUpdatedEmployee(): Employee {
    const formValues = this.employeeForm.value;
    return {
      ...this.currentEmployee!,
      customer: {
        id: this.currentEmployee?.customer?.id ?? 0,
        version: 0,
        createdAt: '',
        updatedAt: '',
        branch: {
          id: this.currentEmployee?.customer?.branch?.id ?? 0,
          name: '',
          version: 0
        },
        companytype: {
          id: this.currentEmployee?.customer?.companytype?.id ?? 0,
          createdAt: '',
          updatedAt: '',
          name: '',
          version: 0
        },
        country: {
          id: this.currentEmployee?.customer?.country?.id ?? 0,
          name: '',
          label: '',
          isDefault: this.currentEmployee?.customer?.country?.isDefault ?? false,
          createdAt: '',
          updatedAt: '',
          version: 0
        },
        state: {
          id: this.currentEmployee?.customer?.state?.id ?? 0,
          name: '',
          createdAt: '',
          updatedAt: '',
          version: 0
        }
      },
      employeeno: formValues.employeeNumber,
      salutation: formValues.salutation
        ? { id: formValues.salutation, name: '', createdAt: '', updatedAt: '', version: 0 }
        : null,
      title: formValues.title
        ? { id: formValues.title.code, name: '', createdAt: '', updatedAt: '', version: 0 }
        : null,
      firstname: formValues.employeeFirstName,
      lastname: formValues.employeeLastName,
      email: formValues.employeeEmail,
      label: '',
      phone: '',
      generalmanagersince: formValues.generalManagerSinceDate ? this.formatDate(formValues.generalManagerSinceDate) : undefined,
      shareholdersince: formValues.shareholderSinceDate ? this.formatDate(formValues.shareholderSinceDate) : undefined,
      soleproprietorsince: formValues.solePropietorSinceDate ? this.formatDate(formValues.solePropietorSinceDate) : undefined,
      coentrepreneursince: formValues.coentrepreneurSinceDate ? this.formatDate(formValues.coentrepreneurSinceDate) : undefined,
      qualificationFZ: null,
      qualificationkmui: formValues.qualificationKMUi,
    };
  }

  private handleSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('CUSTOMERS.MESSAGE.SUCCESS'),
      detail: this.translate.instant('CUSTOMERS.MESSAGE.CREATE_SUCCESS')
    });
  }

  private formatDate(date: Date){
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  private handleError(err: any): void {
    console.error('Error creating customer:', err);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('CUSTOMERS.MESSAGE.ERROR'),
      detail: this.translate.instant('CUSTOMERS.MESSAGE.CREATE_FAILED')
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  clearForm(): void {
    this.employeeForm.reset();
  }

  updateEmployee(updatedEmployee: Employee): void {
    const updateEmployee = this.employeeUtils.updateEmployee(updatedEmployee).subscribe({
      next: (savedEmployee) => this.handleUpdateEmployeeSuccess(savedEmployee),
      error: (err) => this.handleUpdateEmployeeError(err)
    });
    this.subscriptions.add(updateEmployee);
  }

  private handleUpdateEmployeeError(err: any): void {
    if (err.message === 'Conflict detected: employee person version mismatch') {
      this.showOCCErrorModaEmployee = true;
    }
  }

  private handleUpdateEmployeeSuccess(savedEmployee: Employee): void {
    this.showSuccessMessage('TITLE.MESSAGE.UPDATE_SUCCESS');
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
    console.log('current emploee',id);
    this.router.navigate(['.', id], { relativeTo: this.activatedRoute });
  }
}
