import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SalutationUtils } from '../../../../../../master-data/components/salutation/utils/salutation.utils';
import { TitleUtils } from '../../../../../../master-data/components/title/utils/title-utils';
import { EmployeeCategoryUtils } from '../../../../../../master-data/components/employee-qualification/utils/employee-category-utils';
import { Employee } from '../../../../../../../Entities/employee';
import { EmployeeUtils } from '../../../utils/employee.utils';
import { momentFormatDate, momentSafeCreateDate } from '../../../../../../shared/utils/moment-date-utils';
import { CommonMessagesService } from '../../../../../../../Services/common-messages.service';
import { InputNumber } from 'primeng/inputnumber';
import { OccError, OccErrorType } from '../../../../../../shared/utils/occ-error';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { CustomerUtils } from '../../../../../../customer/utils/customer-utils';
import { HttpErrorResponse } from '@angular/common/http';

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
  private readonly employeeCategoryUtils = inject(EmployeeCategoryUtils);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly subscriptions = new Subscription();
  private employeeId!: number;

  public employeeForm!: FormGroup;
  public formType: 'create' | 'update' = 'create';
  public currentEmployee: Employee | undefined;
  public showOCCErrorModaEmployee = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public occRoute = "";
  // Modal delete
  public visibleEmployeeModalDelete: boolean = false;
  public isLoading = false;
  public isLoadingDelete = false;
  public customer: any;
  public customerEmployees: Employee[] = [];
  public employeeNumberAlreadyExist = false;

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

  public employeeCategories = toSignal(
    this.employeeCategoryUtils.getEmployeeCategories().pipe(
      map(q => q.map(({ label, id }) => ({ name: label, id })))
    ),
    { initialValue: [] }
  );

  @ViewChild('inputNumber') firstInput!: InputNumber;

  constructor(private readonly commonMessageService: CommonMessagesService, private readonly translate: TranslateService,) { }

  ngOnInit(): void {
    this.initForm();
    this.firstInputFocus();
    this.activatedRoute.params.subscribe(params => {
      this.employeeId = params['employeeId'];
      this.updateTitle();
      this.setupLangSubcription();
      const customerId = Number(this.activatedRoute.parent?.snapshot.params['id']);
      if (this.employeeId) {
        this.formType = 'update';
        if (customerId) {
          this.loadCustomerEmployees(customerId);
        }
        this.subscriptions.add(
          this.employeeUtils.getEmployeeById(this.employeeId).subscribe({
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
                  generalManagerSinceDate: momentSafeCreateDate(employee.generalmanagersince),
                  shareholderSinceDate: momentSafeCreateDate(employee.shareholdersince),
                  solePropietorSinceDate: momentSafeCreateDate(employee.soleproprietorsince),
                  coentrepreneurSinceDate: momentSafeCreateDate(employee.coentrepreneursince),
                  qualificationFzId: employee.qualificationFZ?.id ?? '',
                  employeeCategory: employee.employeeCategory?.id ?? '',
                  qualificationKMUi: employee.qualificationkmui ?? ''
                });
              }
            },
            error: (err) => console.error('Error loading employee:', err)
          })
        );

      } else {
        this.formType = 'create';
        const customerId = Number(this.activatedRoute.parent?.snapshot.params['id']);
        if (customerId) {
          this.customerUtils.getCustomerById(customerId).subscribe(customer => {
            this.customer = customer;
          });

          this.employeeUtils.getAllEmployeesByCustomerId(customerId).subscribe(employees => {
            this.customerEmployees = employees;
          });
        }
      }
    });

    this.employeeForm.get('employeeNumber')?.valueChanges.subscribe(() => {
      if (this.employeeNumberAlreadyExist) {
        this.employeeNumberAlreadyExist = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupLangSubcription(): void {
    this.subscriptions.add(
      this.translate.onLangChange.subscribe(() => {
        this.updateTitle();
      })
    )
  }

  private firstInputFocus(): void {
    setTimeout(() => {
      if (this.firstInput.input.nativeElement) {
        this.firstInput.input.nativeElement.focus();
      }
    }, 300)
  }

  private initForm(): void {
    const EMAIL_STRICT = String.raw`^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`;
    this.employeeForm = new FormGroup({
      employeeNumber: new FormControl(null, [Validators.required]),
      salutation: new FormControl(''),
      title: new FormControl(''),
      employeeFirstName: new FormControl(''),
      employeeLastName: new FormControl('', [Validators.required]),
      employeeEmail: new FormControl('', [Validators.email, Validators.pattern(EMAIL_STRICT)]),
      generalManagerSinceDate: new FormControl(''),
      shareholderSinceDate: new FormControl(''),
      solePropietorSinceDate: new FormControl(''),
      coentrepreneurSinceDate: new FormControl(''),
      qualificationFzId: new FormControl(''),
      employeeCategory: new FormControl(''),
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
      salutation: this.mapToEntity(formValues.salutation),
      title: this.mapToEntity(formValues.title),
      firstname: formValues.employeeFirstName,
      lastname: formValues.employeeLastName,
      email: formValues.employeeEmail,
      label: '',
      phone: '',
      generalmanagersince: momentFormatDate(formValues.generalManagerSinceDate),
      shareholdersince: momentFormatDate(formValues.shareholderSinceDate),
      soleproprietorsince: momentFormatDate(formValues.solePropietorSinceDate),
      coentrepreneursince: momentFormatDate(formValues.coentrepreneurSinceDate),
      qualificationFZ: this.mapToEntity(formValues.qualificationFzId),
      employeeCategory: this.mapToEntity(formValues.employeeCategory),
      qualificationkmui: formValues.qualificationKMUi,
    };
  }

  private buildEmployeeFromForm(): Omit<Employee, 'id'> {
    const employee = this.buildEmployeeData(this.customer);
    return {
      ...employee,
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private buildUpdatedEmployee(): Employee {
    const result = {
      ...this.currentEmployee!,
      ...this.buildEmployeeData(this.currentEmployee?.customer)
    };

    return result;
  }

  private buildCustomerFromSource(source: any): any {

    const customerData = source || this.currentEmployee?.customer;

    if (!customerData?.id) {
      console.warn('⚠️ No hay customer id disponible');
      return null;
    }

    return {
      id: customerData.id,
      version: 0
    };
  }

  private mapToEntity(id: any, additionalFields: Record<string, any> = {}): any {
    if (!id || id === '' || id === '0') {
      return null;
    }

    const numericId = Number(id);
    if (isNaN(numericId)) {
      return null;
    }

    return {
      id: numericId,
      version: 0,
      ...additionalFields
    };
  }

  private createEmployee(newEmployee: Omit<Employee, 'id'>): void {
    const employeeNumber = newEmployee.employeeno?.toString().trim();
    const exists = this.customerEmployees.some(
      e => e.employeeno?.toString().trim() === employeeNumber
    );

    if (exists) {
      this.commonMessageService.showErrorRecordAlreadyExist();
      this.employeeNumberAlreadyExist = true;
      return;
    }

    this.isLoading = true;
    this.subscriptions.add(
      this.employeeUtils.createNewEmployee(newEmployee).subscribe({
        next: (createdEmployee) => {
          this.isLoading = false;
          this.commonMessageService.showCreatedSuccesfullMessage();
          this.customerEmployees.push(createdEmployee);
          setTimeout(() => {
            this.resetFormAndNavigation(createdEmployee.id);
          }, 2000);
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
    const employeeNumber = updatedEmployee.employeeno?.toString().trim() ?? '';

    if (employeeNumber) {
      const duplicate = this.customerEmployees.some(
        e => e.id !== updatedEmployee.id && e.employeeno?.toString().trim() === employeeNumber
      );

      if (duplicate) {
        this.commonMessageService.showErrorRecordAlreadyExist();
        this.employeeNumberAlreadyExist = true;
        return;
      }
    }

    this.isLoading = true;

    this.subscriptions.add(
      this.employeeUtils.updateEmployee(updatedEmployee).subscribe({
        next: (editedEmployee) => {
          this.isLoading = false;
          this.commonMessageService.showEditSucessfullMessage();
          this.currentEmployee = editedEmployee;

          const index = this.customerEmployees.findIndex(e => e.id === editedEmployee.id);
          if (index !== -1) {
            this.customerEmployees[index] = editedEmployee;
          } else {
            console.warn(`Empleado con id ${editedEmployee.id} no encontrado en la lista local.`);
          }

        },
        error: (err) => {
          this.isLoading = false;
          this.handleUpdateEmployeeError(err);
        }
      })
    );
  }

  onEmployeeDeleteConfirm() {
    this.isLoadingDelete = true;
    if (this.currentEmployee?.id) {
      this.employeeUtils.deleteEmployee(this.currentEmployee.id).subscribe({
        next: () => {
          this.isLoadingDelete = false;
          this.visibleEmployeeModalDelete = false;
          this.commonMessageService.showDeleteSucessfullMessage();
          this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
        },
        error: (error) => {
          this.isLoadingDelete = false;
          this.visibleEmployeeModalDelete = false;
          if (error.message.includes('Cannot be deleted because have associated employment contracts')) {
            this.commonMessageService.showErrorDeleteMessageContainsOtherEntities();
          } else if (error instanceof OccError || error?.message?.includes('404') || error?.errorType === 'DELETE_UNEXISTED') {
            this.showOCCErrorModaEmployee = true;
            this.commonMessageService.showErrorDeleteMessage();
            this.occErrorType = 'DELETE_UNEXISTED';
            this.occRoute = "/customers/employees/" + this.currentEmployee?.customer?.id;
          } else if (error instanceof HttpErrorResponse && error.status === 500 && error.error.message.includes('foreign key constraint')) {
            this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
          } else {
            this.commonMessageService.showErrorDeleteMessage();
          }
        }
      });
    }
  }

  private handleUpdateEmployeeError(error: any): void {
    this.commonMessageService.showErrorEditMessage();
    if (error instanceof OccError) {
      this.showOCCErrorModaEmployee = true;
      this.occErrorType = error.errorType;
      if (this.occErrorType === 'UPDATE_UNEXISTED') {
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

  private updateTitle(): void {
    this.employeeId ?
      this.titleService.setTitle(this.translate.instant('PAGETITLE.CUSTOMERS.EMPLOYEES')) :
      this.titleService.setTitle(this.translate.instant('EMPLOYEE.LABELS.NEW_EMPLOYEE'));
  }

  private loadCustomerEmployees(customerId: number): void {
    this.employeeUtils.getAllEmployeesByCustomerId(customerId).subscribe({
      next: (employees) => {
        this.customerEmployees = employees;
      },
      error: (err) => console.error('Error loading employees list:', err)
    });
  }
}