import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { EmployeeUtils } from '../../../../../customer/sub-modules/employee/utils/employee.utils';
import { SalutationUtils } from '../../../../../master-data/components/salutation/utils/salutation.utils';
import { TitleUtils } from '../../../../../master-data/components/title/utils/title-utils';
import { EmployeeCategoryUtils } from '../../../../../master-data/components/employee-qualification/utils/employee-category-utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Employee } from '../../../../../../Entities/employee';
import { Customer } from '../../../../../../Entities/customer';
import { momentFormatDate } from '../../../../../shared/utils/moment-date-utils';
import { Salutation } from '../../../../../../Entities/salutation';
import { tap } from 'rxjs';
import { Title } from '../../../../../../Entities/title';
import { EmployeeCategory } from '../../../../../../Entities/employee-category ';
import { Select } from 'primeng/select';

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

  public newEmployeeForm!: FormGroup;
  public isLoading = false;

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
  @Output() createdNewEmployee = new EventEmitter<void>();
  @ViewChild('firstInput') firstInput!: Select;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visibleModal'] && this.visibleModal) {
      this.firstInputFocus();
    }

    if((changes['customer'] && this.customer) || (changes['visibleModal'] && this.visibleModal && this.customer)) {
      this.employeeUtils.getNextEmployeeNumber(this.customer.id).subscribe(nextEmployeeNo => {
        if(nextEmployeeNo){
          this.newEmployeeForm.get('employeeNumber')?.setValue(nextEmployeeNo);
        }
      })
    }
  }

  private initForm(): void {
    const EMAIL_STRICT = String.raw`^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$`;
    this.newEmployeeForm = new FormGroup({
      employeeNumber: new FormControl({ value: null, disabled: true }),
      salutation: new FormControl(''),
      title: new FormControl(''),
      firstName: new FormControl(''),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.email, Validators.pattern(EMAIL_STRICT)]),
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
    if(this.newEmployeeForm.invalid || !this.customer) return;
    
    this.customer.version = 0;

    this.isLoading = true;
    const newEmployee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      customer: this.customer,
      employeeno: this.newEmployeeForm.getRawValue().employeeNumber,
      salutation: this.salutationMap.get(this.newEmployeeForm.value.salutation) ?? null,
      title: this.titleMap.get(this.newEmployeeForm.value.title) ?? null,
      firstname: this.newEmployeeForm.value.firstName,
      lastname: this.newEmployeeForm.value.lastName,
      email: this.newEmployeeForm.value.email,
      label: '',
      phone: '',
      generalmanagersince: momentFormatDate(this.newEmployeeForm.value.generalManagerSinceDate),
      shareholdersince: momentFormatDate(this.newEmployeeForm.value.shareholderSinceDate),
      soleproprietorsince: momentFormatDate(this.newEmployeeForm.value.solePropietorSinceDate),
      coentrepreneursince: momentFormatDate(this.newEmployeeForm.value.coentrepreneurSinceDate),
      qualificationFZ: null,
      employeeCategory: this.employeeCategoryMap.get(this.newEmployeeForm.value.employeeCategory) ?? null,
      qualificationkmui: this.newEmployeeForm.value.qualificationKMUi,
    }

    this.employeeUtils.createNewEmployee(newEmployee).subscribe({
      next: (employeeCreated) => {
        this.isLoading = false;
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.handleEmployeeNoComparison(newEmployee.employeeno, employeeCreated.employeeno);
        this.createdNewEmployee.emit();
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

  private handleEmployeeNoComparison(expectedEmployeeNumber: number | undefined, actualEmployeeNo: number): void {
    if (expectedEmployeeNumber === undefined) return;

    if (expectedEmployeeNumber !== actualEmployeeNo) {
      this.commonMessageService.showInformationMessageUpdatedRecordNumber(actualEmployeeNo);
    }
  }

  private firstInputFocus(): void {
    setTimeout(() => {
      if (this.firstInput) {
        setTimeout(() => {
          this.firstInput.focus();
        }, 300)
      }
    })
  }

  closeModal(): void {
    this.closeOutputModal.emit(false);
    this.newEmployeeForm.reset();
  }
}
