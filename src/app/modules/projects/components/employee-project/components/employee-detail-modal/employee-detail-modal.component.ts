import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { EmployeeUtils } from '../../../../../customer/sub-modules/employee/utils/employee.utils';
import { Employee } from '../../../../../../Entities/employee';
import { OrderEmployeeUtils } from '../../../../utils/order-employee.util';
import { OrderEmployee } from '../../../../../../Entities/orderEmployee';
import { Select } from 'primeng/select';
import { Order } from '../../../../../../Entities/order';
import { OrderUtils } from '../../../../../customer/sub-modules/orders/utils/order-utils';

@Component({
  selector: 'app-employee-detail-modal',
  standalone: false,
  templateUrl: './employee-detail-modal.component.html',
  styleUrl: './employee-detail-modal.component.scss'
})
export class EmployeeDetailModalComponent implements OnInit, OnChanges, OnDestroy {
  private readonly employeeUtils = inject(EmployeeUtils);
  private readonly orderEmployeeUtils = inject(OrderEmployeeUtils);
  private readonly ordersUtils = inject(OrderUtils);
  private readonly subscriptions = new Subscription();

  @Input() modalType: 'create' | 'edit' | 'delete' = 'create';
  @Input() visibleModal: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() deleteProjectPackageEvent = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @Input() employeeNo: number | null = null;
  @Input() selectedEmployee: OrderEmployee | null = null;
  @Output() createdOrderEmployee = new EventEmitter<{ status: 'success' | 'error', error?: any }>();
  @Output() updatedOrderEmployee = new EventEmitter<{ status: 'success' | 'error', error?: any }>();

  @ViewChild('pSelect') firstInputForm!: Select;

  isLoading = false;
  isLoadingDelete = false;
  modalDeleteVisible = false;
  projectId = '';
  employees: Employee[] = [];
  orders: Order[] = [];
  orderAlreadyAssigned = false;
  constructor(private readonly activatedRoute: ActivatedRoute) { }

  readonly createEmployeeDetailsForm = new FormGroup({
    employee: new FormControl(),
    employeeNo: new FormControl<number | null>({ value: null, disabled: true }),
    hourlyrate: new FormControl<number | null>(null, [Validators.required,Validators.min(1)]),
    qualificationkmui: new FormControl(''),
    order: new FormControl<number | null>(null,[Validators.required])
  });

  ngOnInit(): void {
    this.subscriptions.add(
      this.activatedRoute.params.subscribe(params => {
        this.projectId = params['idProject'];
      })
    );
    this.loadEmployees();
    this.loadOrders();
    this.subscriptions.add(
      this.createEmployeeDetailsForm.get('employee')?.valueChanges.subscribe((employeeId: number | null) => {
        if(employeeId){
          const employee = this.employees.find(employee => employee.id === employeeId);
          if(employee?.employeeno){
            this.createEmployeeDetailsForm.get('employeeNo')!.setValue(employee.employeeno, { emitEvent: false });
          }
        }else{
          this.createEmployeeDetailsForm.get('employeeNo')!.setValue(null, { emitEvent: false })
        }
      })
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visibleModal'] && this.visibleModal) {
      setTimeout(() => {
        if (this.firstInputForm) {
          setTimeout(() => {
            this.firstInputForm.focus();
          }, 300)
        }
      })
    }

    if (changes['visibleModal'] && !this.visibleModal){
      this.createEmployeeDetailsForm.reset();
    }

    if((changes['selectedEmployee'] || changes['visibleModal']) && this.modalType === 'edit' && this.selectedEmployee){
      const provsionalEmployee = {
        ...this.selectedEmployee.employee,
        displayName: this.selectedEmployee.employee ? this.getEmployeeDisplayName(this.selectedEmployee.employee) : ''
      }

      this.createEmployeeDetailsForm.patchValue({
        employee: provsionalEmployee.id,
        hourlyrate: this.selectedEmployee.hourlyrate,
        qualificationkmui: this.selectedEmployee.qualificationkmui,
        order: this.selectedEmployee.order?.id ?? null
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public loadEmployees(): void {
    const sub = this.employeeUtils.getAllEmployeesByProjectId(Number(this.projectId)).subscribe({
      next: (employees: Employee[]) => {
        this.employees = employees.map(employee => ({
          ...employee,
          displayName: this.getEmployeeDisplayName(employee)
        }));
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.employees = [];
      }
    });
    this.subscriptions.add(sub);
  }

  private loadOrders(): void {
    this.ordersUtils.getAllOrdersByProjectId(Number(this.projectId)).subscribe(orders => {
      this.orders = orders;
    });
  }

  private getEmployeeDisplayName(employee: Employee): string {
    if (employee.firstname && employee.lastname) {
      return `${employee.firstname} ${employee.lastname}`;
    } else if (employee.firstname) {
      return employee.firstname;
    } else if (employee.lastname) {
      return employee.lastname;
    } else if (employee.label) {
      return employee.label;
    } else if (employee.employeeno) {
      return `Employee #${employee.employeeno}`;
    }
    return `Employee ID: ${employee.id}`;
  }

  onSubmit(): void {
    if (this.createEmployeeDetailsForm.invalid || this.isLoading) return;

    if(this.modalType === 'create'){
      this.createOrderEmployee();
    }else if(this.modalType === 'edit'){
      this.updateOrderEmployee();
    }
  }

  private createOrderEmployee(): void {
    this.isLoading = true;
    const newOrderEmployee: Omit<OrderEmployee, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      employee: this.getSelectedEmployee(this.createEmployeeDetailsForm.get('employee')?.value),
      hourlyrate: this.createEmployeeDetailsForm.get('hourlyrate')?.value ?? 0,
      qualificationkmui: this.createEmployeeDetailsForm.get('qualificationkmui')?.value ?? '',
      order: this.getSelectOrder(this.createEmployeeDetailsForm.get('order')?.value ?? null),
      plannedhours: 1,
      title: '',
      qualificationFZ: null
    }
    this.orderEmployeeUtils.addOrderEmployee(newOrderEmployee).subscribe({
      next: () => {
        this.closeAndReset();
        this.createdOrderEmployee.emit({ status: 'success' });
      },
      error: (error) => {
        this.isLoading = false;
        this.handleErrorOrderEmployeeDuplicate(error);
        this.createdOrderEmployee.emit({ status: 'error', error });
      }
    });
  }

  private updateOrderEmployee(): void {
    if(!this.selectedEmployee) return;

    this.isLoading = true;
    const updatedOrderEmployee: OrderEmployee = {
      ...this.selectedEmployee,
      employee: this.getSelectedEmployee(this.createEmployeeDetailsForm.get('employee')?.value),
      hourlyrate: this.createEmployeeDetailsForm.get('hourlyrate')?.value ?? 0,
      qualificationkmui: this.createEmployeeDetailsForm.get('qualificationkmui')?.value ?? '',
      order: this.getSelectOrder(this.createEmployeeDetailsForm.get('order')?.value ?? null),
    }
    this.orderEmployeeUtils.updateOrderEmployee(updatedOrderEmployee).subscribe({
      next: () => {
        this.closeAndReset();
        this.updatedOrderEmployee.emit({ status: 'success' });
      },
      error: (error) => {
        this.isLoading = false;
        this.isVisibleModal.emit(false);
        this.updatedOrderEmployee.emit({ status: 'error', error });
        this.handleErrorOrderEmployeeDuplicate(error);
      }
    });
  }

  private handleErrorOrderEmployeeDuplicate(error: any): void {
    const duplicationRegex = /Employee with ID (\d+) is already assigned to Order with ID (\d+)/;
    if (error.error.message?.match(duplicationRegex)) {
      this.orderAlreadyAssigned = true;
      this.createEmployeeDetailsForm.get('order')?.valueChanges.pipe(take(1))
        .subscribe(() => this.orderAlreadyAssigned = false);
    }
  }

  private getSelectedEmployee(employeeId: number | null): Employee | null {
    return employeeId ? this.employees.find(employee => employee.id === employeeId) ?? null : null;
  }

  private getSelectOrder(orderId: number | null): Order | null {
    return orderId ? this.orders.find(order => order.id === orderId) ?? null : null;
  }

  closeAndReset(): void {
    this.isLoading = false;
    this.modalDeleteVisible = false;
    this.resetForm();
    this.isVisibleModal.emit(false);
  }

  resetForm(): void {
    this.createEmployeeDetailsForm.reset();
  }

  onCancel(): void {
    this.closeAndReset();
  }

  get isCreateEmployeeDetailsMode(): boolean {
    return this.modalType === 'create' || this.modalType === 'edit';
  }

  onDeleteConfirm(): void {
    if (!this.selectedEmployee?.id) return;
    this.isLoadingDelete = true;
    
    const sub = this.orderEmployeeUtils
    .deleteOrderEmployee(this.selectedEmployee.id)
    .subscribe({
      next: () => {
        this.isLoadingDelete = false;
        this.deleteProjectPackageEvent.emit({ status: 'success' });
        this.closeAndReset();
      },
      error: (error: Error) => {
        this.isLoadingDelete = false;
        this.modalDeleteVisible = false;
        this.isVisibleModal.emit(false);
        this.deleteProjectPackageEvent.emit({ status: 'error', error });
      }
    });
    this.subscriptions.add(sub);
  }
}
