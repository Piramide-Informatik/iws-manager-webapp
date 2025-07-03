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
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly subscriptions = new Subscription();

  public employeeForm!: FormGroup;

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

    const newEmployee = this.buildEmployeeFromForm();

    console.log('Creating new employee:', newEmployee);
    
    this.subscriptions.add(
      this.employeeUtils.createNewEmployee(newEmployee).subscribe({
        next: () => this.handleSuccess(),
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
        id: 1689,
        version: 0,
        createdAt: '',
        updatedAt: '',
        branch: null,
        companytype: null,
        country: null,
        state: null
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

  private handleSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('CUSTOMERS.MESSAGE.SUCCESS'),
      detail: this.translate.instant('CUSTOMERS.MESSAGE.CREATE_SUCCESS')
    });
    this.clearForm();
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
}
