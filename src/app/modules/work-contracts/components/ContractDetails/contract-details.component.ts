import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
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
import { Select } from 'primeng/select';

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
  @Input() currentEmploymentContractEntity!: EmploymentContract | undefined;
  @Input() visibleModal: boolean = false;

  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() deletedEmployeeContract = new EventEmitter<EmploymentContract>();
  @Output() onContractCreated = new EventEmitter<EmploymentContract>();
  @Output() onContractUpdated = new EventEmitter<EmploymentContract>();

  @ViewChild('pSelect') firstInputForm!: Select;

  public showOCCErrorModalContract = false;
  public ContractDetailsForm!: FormGroup;
  public employeeSelectOptions: {employeeNo: number, employeeId: number}[] = [];

  public isEmployeeContractLoading: boolean = false;
  public visiblEmployeeContractModal: boolean = false;
  private readonly employeesMap: Map<number, Employee> = new Map();
  errorMsg: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if((changes['currentEmploymentContractEntity'] || changes['visibleModal']) && (this.modalType === 'edit' && this.currentEmploymentContractEntity)){
      this.initContractDetailsForm();
      if(this.currentEmploymentContractEntity.customer){
        this.loadEmployeesByCustomer(this.currentEmploymentContractEntity.customer?.id)
      }
      this.laodDataToForm();
    }
    if(changes['modalType'] && this.modalType === 'create'){
      this.initContractDetailsForm();
      this.ContractDetailsForm.reset();
    }
    if (changes['visibleModal'] && !changes['visibleModal'].currentValue) {
    this.ContractDetailsForm.reset();
    }
    if(changes['visibleModal'] && this.visibleModal && this.isCreateMode){
      if(this.firstInputForm){
          setTimeout(()=>{
            this.firstInputForm.focus();
            this.firstInputForm.show();
          },300)
        }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.initContractDetailsForm();
    if (this.modalType === 'create') {
      this.getCurrentCustomer();
    }
  }

  private laodDataToForm(): void {
    this.ContractDetailsForm.patchValue({
      employeNro: this.currentEmploymentContractEntity?.employee?.id,
      startDate: momentCreateDate(this.currentEmploymentContractEntity?.startDate),
      salaryPerMonth: this.currentEmploymentContractEntity?.salaryPerMonth,
      hoursPerWeek: this.currentEmploymentContractEntity?.hoursPerWeek,
      workShortTime: this.currentEmploymentContractEntity?.workShortTime,
      specialPayment: this.currentEmploymentContractEntity?.specialPayment,
      maxHoursPerMonth: this.currentEmploymentContractEntity?.maxHoursPerMonth,
      maxHoursPerDay: this.currentEmploymentContractEntity?.maxHoursPerDay,
      hourlyRate: this.currentEmploymentContractEntity?.hourlyRate,
      hourlyRealRate: this.currentEmploymentContractEntity?.hourlyRealRate,
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
          this.employeeSelectOptions = employees.map((emp: Employee) => ({ employeeNo: emp.employeeno ?? 0 , employeeId: emp.id }));
          // Guardar empleados en un mapa para acceso rápido
          this.employeesMap.clear();
          employees.forEach((emp: Employee) => {
            this.employeesMap.set(emp.id, emp);
          });
        },
        error: () => {
          this.employeeSelectOptions = [];
          this.employeesMap.clear();
        }
      })
    );
  }
  
  private initContractDetailsForm(): void {
    this.ContractDetailsForm = new FormGroup({
      employeNro: new FormControl('', []),
      firstName: new FormControl('', []),
      lastName: new FormControl('', []),
      startDate: new FormControl('', []),
      salaryPerMonth: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      hoursPerWeek: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      workShortTime: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      specialPayment: new FormControl(null, [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      maxHoursPerMonth: new FormControl(null, []),
      maxHoursPerDay: new FormControl(null, []),
      hourlyRate: new FormControl(null, []),
      hourlyRealRate: new FormControl(null)
    });
    
    this.disableFormControls();
    this.setupFormSubscriptions();
  }

  private disableFormControls(): void {
    this.ContractDetailsForm.get("firstName")?.disable();
    this.ContractDetailsForm.get("lastName")?.disable();
    this.ContractDetailsForm.get("hourlyRate")?.disable();
    this.ContractDetailsForm.get("hourlyRealRate")?.disable();
    this.ContractDetailsForm.get("maxHoursPerDay")?.disable();
    this.ContractDetailsForm.get("maxHoursPerMonth")?.disable();
  }

  private setupFormSubscriptions(): void {
    // Suscribcion a cambios en el campo employeNro
    this.subscription.add(
      this.ContractDetailsForm.get('employeNro')!.valueChanges.subscribe(
        (employeeId: number) => this.onEmployeeIdChange(employeeId)
      )
    );

    const calculationFields = ['salaryPerMonth', 'specialPayment', 'hoursPerWeek', 'workShortTime'];
  
    calculationFields.forEach(field => {
      this.subscription.add(
        this.ContractDetailsForm.get(field)!.valueChanges.pipe(
          debounceTime(300) // Esperar 300ms después de la última tecla
        ).subscribe(() => this.calculateAllFields())
      );
    });
  }

  private onEmployeeIdChange(employeeId: number): void {
    const emp = this.employeesMap.get(employeeId);
    if (emp) {
      this.ContractDetailsForm.get('firstName')?.setValue(emp.firstname ?? '', { emitEvent: false});
      this.ContractDetailsForm.get('lastName')?.setValue(emp.lastname ?? '', { emitEvent: false});
    } else {
      this.ContractDetailsForm.get('firstName')?.setValue('', { emitEvent: false});
      this.ContractDetailsForm.get('lastName')?.setValue('', { emitEvent: false});
    }
  }

  private calculateAllFields(): void {
    const salary = this.ContractDetailsForm.get('salaryPerMonth')?.value ?? 0;
    const specialPayment = this.ContractDetailsForm.get('specialPayment')?.value ?? 0;
    const hoursPerWeek = this.ContractDetailsForm.get('hoursPerWeek')?.value;
    const workShortTime = this.ContractDetailsForm.get('workShortTime')?.value || 0;

    // Validar que los campos requeridos tengan valores válidos
    const hasValidHours = hoursPerWeek !== null && hoursPerWeek !== undefined && hoursPerWeek > 0;
    const hasValidSalary = salary !== null && salary !== undefined && salary >= 0;
    const hasValidSpecialPayment = specialPayment !== null && specialPayment !== undefined && specialPayment >= 0;

    try {
      // Solo calcular maxHours si tenemos horas válidas
      if (hasValidHours) {
        this.calculateMaxHours(hoursPerWeek, workShortTime);
      } else {
        this.ContractDetailsForm.get('maxHoursPerDay')?.setValue(null, { emitEvent: false });
        this.ContractDetailsForm.get('maxHoursPerMonth')?.setValue(null, { emitEvent: false });
      }

      // Solo calcular hourly rates si tenemos todos los datos necesarios
      if (hasValidHours && hasValidSalary && hasValidSpecialPayment) {
        this.calculateHourlyRates(salary, specialPayment, hoursPerWeek);
      } else {
        this.ContractDetailsForm.get('hourlyRate')?.setValue(null, { emitEvent: false });
        this.ContractDetailsForm.get('hourlyRealRate')?.setValue(null, { emitEvent: false });
      }

    } catch (error) {
      console.error('Error en cálculos:', error);
    }
  }

  private calculateMaxHours(hoursPerWeek: number, workShortTime: number): void {
    const maxHoursPerDay = hoursPerWeek / 5;
    
    // maxHoursPerMonth: weekly hours * 52 / 12 * (1 – hour reduction)
    const hourReduction = workShortTime / 100; // Convertir porcentaje a decimal
    const maxHoursPerMonth = (hoursPerWeek * 52 / 12) * (1 - hourReduction);
    
    this.ContractDetailsForm.get('maxHoursPerDay')?.setValue(
      this.roundToTwoDecimals(maxHoursPerDay), 
      { emitEvent: false }
    );
    
    this.ContractDetailsForm.get('maxHoursPerMonth')?.setValue(
      this.roundToTwoDecimals(maxHoursPerMonth), 
      { emitEvent: false }
    );
  }

  private calculateHourlyRates(salary: number, specialPayment: number, hoursPerWeek: number): void {
    // Fórmula: (Salary + Annual Special Payment / 12) / (Weekly hours * 52 / 12)
    const monthlySpecialPayment = specialPayment / 12;
    const totalMonthlyCompensation = salary + monthlySpecialPayment;
    const monthlyHours = (hoursPerWeek * 52) / 12;
    
    const hourlyRate = totalMonthlyCompensation / monthlyHours;
    
    this.ContractDetailsForm.get('hourlyRate')?.setValue(
      this.roundToTwoDecimals(hourlyRate), 
      { emitEvent: false }
    );
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  onSubmit() {
    if (this.modalType === 'create') {
      this.createWorkContract();
    } else if (this.modalType === 'edit') {
      this.updateWorkContract();
    }
  }

  createWorkContract() {
    if (this.ContractDetailsForm.invalid || this.isEmployeeContractLoading) return;

    this.isEmployeeContractLoading = true;
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
    const hourlyRealRate = Number(raw.hourlyRealRate ?? 0);
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
        this.isEmployeeContractLoading = false;
        this.onContractCreated.emit(createdContract);
        this.isVisibleModal.emit(false);
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.ContractDetailsForm.reset();
      },
      error: (error) => {
        this.isEmployeeContractLoading = false;
        this.errorMsg = error.message;
        this.isVisibleModal.emit(false);
        this.commonMessageService.showErrorCreatedMessage();
        this.ContractDetailsForm.reset();
      }
    });
  }

  private updateWorkContract() {
    if(this.ContractDetailsForm.invalid || !this.currentEmploymentContractEntity) return

    const updatedEmployment: EmploymentContract = {
      ...this.currentEmploymentContractEntity,
      employee: this.employeesMap.get(this.ContractDetailsForm.value.employeNro),
      startDate: this.ContractDetailsForm.value.startDate,
      salaryPerMonth: this.ContractDetailsForm.value.salaryPerMonth,
      hoursPerWeek: this.ContractDetailsForm.value.hoursPerWeek,
      workShortTime: this.ContractDetailsForm.value.workShortTime,
      specialPayment: this.ContractDetailsForm.value.specialPayment,
      maxHoursPerMonth: this.ContractDetailsForm.getRawValue().maxHoursPerMonth,
      maxHoursPerDay: this.ContractDetailsForm.getRawValue().maxHoursPerDay,
      hourlyRate: this.ContractDetailsForm.getRawValue().hourlyRate,
      hourlyRealRate: this.ContractDetailsForm.getRawValue().hourlyRealRate
    }

    this.isEmployeeContractLoading = true;
    this.employeeContractUtils.updateEmploymentContract(updatedEmployment).subscribe({
      next: (updated: EmploymentContract) => {
        this.isEmployeeContractLoading = false;
        this.onContractUpdated.emit(updated);
        this.closeModal();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error) => {
        this.isEmployeeContractLoading = false;
        console.log(error);
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

  deleteEmployeeContractEntity() {
    if (this.currentEmploymentContractEntity) {
      this.isEmployeeContractLoading = true;
      this.employeeContractUtils.deleteEmploymentContract(this.currentEmploymentContractEntity.id).subscribe({
        next: () => {
          this.isEmployeeContractLoading = false;
          this.visiblEmployeeContractModal = false;
          this.isVisibleModal.emit(false);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.deletedEmployeeContract.emit(this.currentEmploymentContractEntity);
        },
        error: (error) => {
          this.isEmployeeContractLoading = false;
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
  }
}
