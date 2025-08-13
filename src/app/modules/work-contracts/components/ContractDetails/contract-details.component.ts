import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { EmploymentContractUtils } from '../../../employee/utils/employment-contract-utils';
import { Customer } from '../../../../Entities/customer';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { EmploymentContract } from '../../../../Entities/employment-contract';
import { EmployeeUtils } from '../../../employee/utils/employee.utils';
import { buildCustomer } from '../../../shared/utils/builders/customer';
import { buildEmployee } from '../../../shared/utils/builders/employee';
import { momentFormatDate, momentCreateDate } from '../../../shared/utils/moment-date-utils';
import { Employee } from '../../../../Entities/employee';

@Component({
  selector: 'app-contract-details',
  standalone: false,
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss'
})
export class ContractDetailsComponent implements OnInit, OnDestroy, OnChanges {
  private readonly subscription = new Subscription();
  private readonly employeeContractUtils = inject(EmploymentContractUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly employeeUtils = inject(EmployeeUtils);
  private readonly commonMessageService = inject(CommonMessagesService);

  @Input() currentCustomer!: Customer | undefined;
  @Input() modalType: 'create' | 'delete' | 'edit' = "create";
  @Input() currentEmploymentContract!: EmploymentContract | undefined;
  @Input() visibleModal: boolean = false;

  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() deletedEmployeeContract = new EventEmitter<EmploymentContract>();
  @Output() onContractCreated = new EventEmitter<EmploymentContract>();
  @Output() onContractUpdated = new EventEmitter<EmploymentContract>();

  public showOCCErrorModalContract = false;
  public ContractDetailsForm!: FormGroup;
  employeeOptions: {label: string, value: number}[] = [];

  public isLoading: boolean = false;
  public visibleContractModal: boolean = false;
  private readonly employeesMap: Map<number, Employee> = new Map();
  errorMsg: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if((changes['currentEmploymentContract'] || changes['visibleModal']) && (this.modalType === 'edit' && this.currentEmploymentContract)){
      this.initContractDetailsForm();
      if(this.currentEmploymentContract.customer){
        this.loadEmployeesByCustomer(this.currentEmploymentContract.customer?.id)
      }
      this.laodDataToForm();
    }
    if(changes['modalType'] && this.modalType === 'create'){
      this.initContractDetailsForm();
      this.ContractDetailsForm.reset();
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.initContractDetailsForm();
    if (this.modalType === 'create') {
      this.getCurrentCustomer();
    }
  }

  private laodDataToForm(): void {
    this.ContractDetailsForm.patchValue({
      employeNro: this.currentEmploymentContract?.employee?.id,
      startDate: momentCreateDate(this.currentEmploymentContract?.startDate),
      salaryPerMonth: this.currentEmploymentContract?.salaryPerMonth,
      hoursPerWeek: this.currentEmploymentContract?.hoursPerWeek,
      workShortTime: this.currentEmploymentContract?.workShortTime,
      specialPayment: this.currentEmploymentContract?.specialPayment,
      maxHoursPerMonth: this.currentEmploymentContract?.maxHoursPerMonth,
      maxHoursPerDay: this.currentEmploymentContract?.maxHoursPerDay,
      hourlyRate: this.currentEmploymentContract?.hourlyRate
    });
  }

  private getCurrentCustomer(): void {
    this.route.params.subscribe(params => {
      const customerId = params['id'];
    if (customerId) {
      this.subscription.add(
        this.customerUtils.getCustomerById(customerId).subscribe(customer => {
          this.currentCustomer = customer;
          customer?.id && this.loadEmployeesByCustomer(customer.id);
        })
      );
    }
    });

  }

  private loadEmployeesByCustomer(customerId: number): void {
    this.subscription.add(
      this.employeeUtils.getAllEmployeesByCustomerId(customerId).subscribe({
        next: (employees: Employee[]) => {
          this.employeeOptions = employees.map((emp: Employee) => ({ label: emp.firstname + ' ' + emp.lastname, value: emp.id }));
          // Guardar empleados en un mapa para acceso rápido
          this.employeesMap.clear();
          employees.forEach((emp: Employee) => {
            this.employeesMap.set(emp.id, emp);
          });
        },
        error: () => {
          this.employeeOptions = [];
          this.employeesMap.clear();
        }
      })
    );
  }
  
  private initContractDetailsForm(): void {
    this.ContractDetailsForm = new FormGroup({
      startDate: new FormControl('', []),
      salaryPerMonth: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      hoursPerWeek: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      workShortTime: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      specialPayment: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      maxHoursPerMonth: new FormControl(null, []),
      maxHoursPerDay: new FormControl(null, []),
      hourlyRate: new FormControl(null, []),
      lastName: new FormControl('', []),
      firstName: new FormControl('', []),
      employeNro: new FormControl('', []),
    });
    this.ContractDetailsForm.get("firstName")?.disable();
    this.ContractDetailsForm.get("lastName")?.disable();
    this.ContractDetailsForm.get("hourlyRate")?.disable();
    this.ContractDetailsForm.get("maxHoursPerDay")?.disable();
    this.ContractDetailsForm.get("maxHoursPerMonth")?.disable();

    // Suscribirse a cambios en el campo employeNro
    this.subscription.add(
      this.ContractDetailsForm.get('employeNro')!.valueChanges.subscribe((employeeId: number) => {
        const emp = this.employeesMap.get(employeeId);
        if (emp) {
          this.ContractDetailsForm.get('firstName')?.setValue(emp.firstname ?? '');
          this.ContractDetailsForm.get('lastName')?.setValue(emp.lastname ?? '');
        } else {
          this.ContractDetailsForm.get('firstName')?.setValue('');
          this.ContractDetailsForm.get('lastName')?.setValue('');
        }
      })
    );
  }

  onSubmit() {
    if (this.modalType === 'create') {
      this.createWorkContract();
    } else if (this.modalType === 'edit') {
      this.updateWorkContract();
    }
  }

  createWorkContract() {
    if (this.ContractDetailsForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMsg = null;

    if (!this.currentCustomer) {
      const customerId = this.route.snapshot.paramMap.get('id');
      if (customerId) {
        this.customerUtils.getCustomerById(Number(customerId)).subscribe(customer => {
          this.currentCustomer = customer;
          if (customer?.id) {
            this.loadEmployeesByCustomer(customer.id);
          }
          this._doCreateWorkContract();
        });
        return;
      }
    }
    this._doCreateWorkContract();
  }

  private _doCreateWorkContract() {
    const raw = this.ContractDetailsForm.getRawValue();
    const startDate = raw.startDate ? momentFormatDate(raw.startDate) : '';
    const salaryPerMonth = Number(raw.salaryPerMonth ?? 0);
    const hoursPerWeek = Number(raw.hoursPerWeek ?? 0);
    const workShortTime = Number(raw.workShortTime ?? 0);
    const specialPayment = Number(raw.specialPayment ?? 0);
    const maxHoursPerMonth = Number(raw.maxHoursPerMonth ?? 0);
    const maxHoursPerDay = Number(raw.maxHoursPerDay ?? 0);
    const hourlyRate = Number(raw.hourlyRate ?? 0);
    const hourlyRealRate = 0;
    const emp = this.employeesMap.get(raw.employeNro);
    const employeeObj = emp ? buildEmployee(emp, { includeEmptyDates: true }) : null;
    const customerObj = this.currentCustomer ? buildCustomer(this.currentCustomer, { includeEmptyDates: true }) : null;

    const newWorkContract: Omit<EmploymentContract, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      startDate,
      salaryPerMonth,
      hoursPerWeek,
      workShortTime,
      specialPayment,
      maxHoursPerMonth,
      maxHoursPerDay,
      hourlyRate,
      hourlyRealRate,
      employee: employeeObj!,
      customer: customerObj!
    };

    this.employeeContractUtils.createNewEmploymentContract(newWorkContract).subscribe({
      next: (createdContract) => {
        this.isLoading = false;
        this.onContractCreated.emit(createdContract);
        this.isVisibleModal.emit(false);
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.ContractDetailsForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMsg = error.message;
        this.isVisibleModal.emit(false);
        this.commonMessageService.showErrorCreatedMessage();
        this.ContractDetailsForm.reset();
      }
    });
  }

  private updateWorkContract() {
    if(this.ContractDetailsForm.invalid || !this.currentEmploymentContract) return

    const updatedEmployment: EmploymentContract = {
      ...this.currentEmploymentContract,
      startDate: this.ContractDetailsForm.value.startDate,
      salaryPerMonth: this.ContractDetailsForm.value.salaryPerMonth,
      hoursPerWeek: this.ContractDetailsForm.value.hoursPerWeek,
      workShortTime: this.ContractDetailsForm.value.workShortTime,
      specialPayment: this.ContractDetailsForm.value.specialPayment,
    }

    this.isLoading = true;
    this.employeeContractUtils.updateEmploymentContract(updatedEmployment).subscribe({
      next: (updated: EmploymentContract) => {
        this.isLoading = false;
        this.onContractUpdated.emit(updated);
        this.closeModal();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: () => {
        this.isLoading = false;
        this.commonMessageService.showErrorEditMessage();
      }
    });
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.ContractDetailsForm.reset();
  }

  deleteEmployeeContract() {
    if (this.currentEmploymentContract) {
      this.isLoading = true;
      this.employeeContractUtils.deleteEmploymentContract(this.currentEmploymentContract.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.visibleContractModal = false;
          this.isVisibleModal.emit(false);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.deletedEmployeeContract.emit(this.currentEmploymentContract);
        },
        error: (error) => {
          this.isLoading = false;
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
  }
}
