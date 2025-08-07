import { Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { EmploymentContractUtils } from '../../../employee/utils/employment-contract-utils';
import { Customer } from '../../../../Entities/customer';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { EmploymentContract } from '../../../../Entities/employment-contract';
import { EmployeeUtils } from '../../../employee/utils/employee.utils';
import { buildCustomer } from '../../../shared/utils/builders/customer';
import { buildEmployee } from '../../../shared/utils/builders/employee';
import { momentFormatDate } from '../../../shared/utils/moment-date-utils';

@Component({
  selector: 'app-contract-details',
  standalone: false,
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss'
})
export class ContractDetailsComponent implements OnDestroy {

  private readonly subscription = new Subscription();
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  private readonly employeeContractUtils = inject(EmploymentContractUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly employeeUtils = inject(EmployeeUtils);

  @Input() currentCustomer!: Customer | undefined;
  @Input() modalType: string = "create";
  @Input() workContract!: any;

  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() deletedEmployeeContract = new EventEmitter<any>();
  @Output() onContractCreated = new EventEmitter<EmploymentContract>();

  public showOCCErrorModalContract = false;
  public ContractDetailsForm!: FormGroup;
  employeeOptions: any[] = [];

  private isLoading = false;
  private readonly employeesMap: Map<number, any> = new Map();
  employeeNumber: any;
  isDeleteEmployeeContract: boolean = false;
  errorMsg: string | null = null;

  constructor( private readonly commonMessageService: CommonMessagesService) {}


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
        next: (employees: any[]) => {
          this.employeeOptions = employees.map((emp: any) => ({ label: emp.firstname + ' ' + emp.lastname, value: emp.id }));
          // Guardar empleados en un mapa para acceso rápido
          this.employeesMap.clear();
          employees.forEach((emp: any) => {
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
          if (customer && customer.id) {
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

  updateWorkContract() {
    // Implementar lógica de actualización si es necesario
  }

  goBackListContracts() {
    this.isVisibleModal.emit(false);
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.ContractDetailsForm.reset();
  }

  deleteEmployeeContract() {
    if (this.workContract) {
      this.isDeleteEmployeeContract = true;
      this.employeeContractUtils.deleteEmploymentContract(this.workContract.id).subscribe({
        next: () => {
          this.isDeleteEmployeeContract = false;
          this.isVisibleModal.emit(false);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.deletedEmployeeContract.emit(this.workContract);
        },
        error: (error) => {
          this.isDeleteEmployeeContract = false;
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
  }
}
