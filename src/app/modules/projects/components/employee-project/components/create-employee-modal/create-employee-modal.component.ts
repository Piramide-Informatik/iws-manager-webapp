import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { EmployeeUtils } from '../../../../../customer/sub-modules/employee/utils/employee.utils';
import { SalutationUtils } from '../../../../../master-data/components/salutation/utils/salutation.utils';
import { TitleUtils } from '../../../../../master-data/components/title/utils/title-utils';
import { EmployeeCategoryUtils } from '../../../../../master-data/components/employee-qualification/utils/employee-category-utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { InputNumber } from 'primeng/inputnumber';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Employee } from '../../../../../../Entities/employee';
import { Customer } from '../../../../../../Entities/customer';
import { momentFormatDate } from '../../../../../shared/utils/moment-date-utils';
import { Salutation } from '../../../../../../Entities/salutation';
import { tap } from 'rxjs';
import { Title } from '../../../../../../Entities/title';
import { EmployeeCategory } from '../../../../../../Entities/employee-category ';

@Component({
  selector: 'app-create-employee-modal',
  standalone: false,
  templateUrl: './create-employee-modal.component.html',
  styleUrl: './create-employee-modal.component.scss'
})
export class CreateEmployeeModalComponent implements OnInit, OnChanges{
  private readonly employeeUtils = inject(EmployeeUtils);
  private readonly salutationUtils = inject(SalutationUtils);
  private readonly titleUtils = inject(TitleUtils);
  private readonly employeeCategoryUtils = inject(EmployeeCategoryUtils);
  private readonly commonMessageService = inject(CommonMessagesService);

  public employeeForm!: FormGroup;
  public isLoading = false;
  public employeeNumberAlreadyExist = false;

  private readonly salutationMap = new Map<number, Salutation>();
  public salutations = toSignal(
    this.salutationUtils.getSalutationsSortedByName().pipe(
      tap(salutations => {
        salutations.forEach(salutation => {
          this.salutationMap.set(salutation.id, salutation);
        })
    })),
    { initialValue: [] }
  );

  private readonly titleMap = new Map<number, Title>();
  public titles = toSignal(
    this.titleUtils.getTitlesSortedByName().pipe(
      tap(titles => {
        titles.forEach(title => {
          this.titleMap.set(title.id, title);
        })
    })),
    { initialValue: [] }
  );

  private readonly employeeCategoryMap = new Map<number, EmployeeCategory>();
  public employeeCategories = toSignal(
    this.employeeCategoryUtils.getEmployeeCategories().pipe(
      tap(empCategories => {
        empCategories.forEach(empCategory => {
          this.employeeCategoryMap.set(empCategory.id, empCategory);
        })
    })),
    { initialValue: [] }
  );

  @Input() customer!: Customer | null;
  @Input() visibleModal = false;
  @Output() closeOutputModal = new EventEmitter<boolean>();
  @Output() openCreateModalOrderEmployee = new EventEmitter<void>();
  @ViewChild('inputNumber') firstInput!: InputNumber;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visibleModal'] && this.visibleModal) {
      this.firstInputFocus();
    }
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
      qualificationFz: new FormControl(''),
      employeeCategory: new FormControl(''),
      qualificationKMUi: new FormControl('')
    });
  }

  onSubmit(): void {
    if(this.employeeForm.invalid || !this.customer) return;
    
    this.customer.version = 1;

    this.isLoading = true;
    const newEmployee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      customer: this.customer,
      employeeno: this.employeeForm.value.employeeNumber,
      salutation: this.salutationMap.get(this.employeeForm.value.salutation) ?? null,
      title: this.titleMap.get(this.employeeForm.value.title) ?? null,
      firstname: this.employeeForm.value.employeeFirstName,
      lastname: this.employeeForm.value.employeeLastName,
      email: this.employeeForm.value.employeeEmail,
      label: '',
      phone: '',
      generalmanagersince: momentFormatDate(this.employeeForm.value.generalManagerSinceDate),
      shareholdersince: momentFormatDate(this.employeeForm.value.shareholderSinceDate),
      soleproprietorsince: momentFormatDate(this.employeeForm.value.solePropietorSinceDate),
      coentrepreneursince: momentFormatDate(this.employeeForm.value.coentrepreneurSinceDate),
      qualificationFZ: null,
      employeeCategory: this.employeeCategoryMap.get(this.employeeForm.value.employeeCategory) ?? null,
      qualificationkmui: this.employeeForm.value.qualificationKMUi,
    }

    this.employeeUtils.createNewEmployee(newEmployee).subscribe({
      next: () => {
        this.isLoading = false;
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.closeModal();
        setTimeout(() => {
          this.openCreateModalOrderEmployee.emit();
        },500);
      },
      error: (error) => {
        this.isLoading = false;
        this.commonMessageService.showErrorCreatedMessage();
      }
    });
  }

  private firstInputFocus(): void {
    setTimeout(() => {
      if (this.firstInput.input.nativeElement) {
        this.firstInput.input.nativeElement.focus();
      }
    }, 300)
  }

  closeModal(): void {
    this.closeOutputModal.emit(false);
    this.employeeForm.reset();
  }
}
