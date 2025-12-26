import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmployeeUtils } from '../../../../../customer/sub-modules/employee/utils/employee.utils';
import { Employee } from '../../../../../../Entities/employee';
import { OrderEmployeeUtils } from '../../../../utils/order-employee.util';
import { OrderEmployee } from '../../../../../../Entities/orderEmployee';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-employee-detail-modal',
  standalone: false,
  templateUrl: './employee-detail-modal.component.html',
  styleUrl: './employee-detail-modal.component.scss'
})
export class EmployeeDetailModalComponent implements OnInit, OnChanges, OnDestroy {
  private readonly employeeUtils = inject(EmployeeUtils);
  private readonly orderEmployeeUtils = inject(OrderEmployeeUtils);
  private readonly subscriptions = new Subscription();

  @Input() modalType: 'create' | 'edit' | 'delete' = 'create';
  @Input() visibleModal: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() deleteProjectPackageEvent = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @Input() employeeNo: number | null = null;
  @Input() employeeToDelete: OrderEmployee | null = null;
  @Output() createdOrderEmployee = new EventEmitter<{ status: 'success' | 'error', error?: any }>();

  @ViewChild('pSelect') firstInputForm!: Select;

  isLoading = false;
  projectId = '';
  employees: Employee[] = [];

  constructor(private readonly activatedRoute: ActivatedRoute) { }

  readonly createEmployeeDetailsForm = new FormGroup({
    employee: new FormControl(),
    employeeNo: new FormControl<number | null>({ value: null, disabled: true }),
    hourlyrate: new FormControl(null),
    qualificationkmui: new FormControl('')
  });

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['idProject'];
    });
    this.loadEmployees();
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
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private loadEmployees(): void {
    const sub = this.employeeUtils.getEmployeesSortedByName().subscribe({
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

    this.isLoading = true;
    const newOrderEmployee: Omit<OrderEmployee, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      employee: this.getSelectedEmployee(this.createEmployeeDetailsForm.get('employee')?.value),
      hourlyrate: this.createEmployeeDetailsForm.get('hourlyrate')?.value ?? 0,
      qualificationkmui: this.createEmployeeDetailsForm.get('qualificationkmui')?.value ?? '',
      plannedhours: 0,
      title: '',
      order: null,
      qualificationFZ: null
    }
    this.orderEmployeeUtils.addOrderEmployee(newOrderEmployee).subscribe({
      next: () => {
        this.closeAndReset();
        this.createdOrderEmployee.emit({ status: 'success' });
      },
      error: (error) => {
        this.closeAndReset();
        this.createdOrderEmployee.emit({ status: 'error', error });
      }
    });
  }

  private getSelectedEmployee(employeeId: number | null | undefined): Employee | null {
    return employeeId ? this.employees.find(employee => employee.id === employeeId) ?? null : null;
  }

  closeAndReset(): void {
    this.isLoading = false;
    this.resetForm();
    this.isVisibleModal.emit(false);
  }

  resetForm(): void {
    this.createEmployeeDetailsForm.reset();
  }

  onCancel(): void {
    this.closeAndReset();
  }

  removeFromProject(): void {
    this.closeAndReset();
  }

  // Método para cuando cambia la selección del empleado
  onEmployeeChange(event: any): void {
    const employeeId = event.value;
    const selectedEmployee = this.employees.find(emp => emp.id === employeeId);

    if (selectedEmployee) {
      this.createEmployeeDetailsForm.patchValue({
        employeeNo: selectedEmployee.employeeno || null,
        // Si quieres llenar automáticamente otros campos:
        // hourlyrate: selectedEmployee.hourlyRate || '',
        // qualificationkmui: selectedEmployee.qualificationkmui || ''
      });
    }
  }
  get isCreateEmployeeDetailsMode(): boolean {
    return this.modalType === 'create' || this.modalType === 'edit';
  }

  onDeleteConfirm(): void {
    if (!this.employeeToDelete?.id) return;
    this.isLoading = true;
    
    const sub = this.orderEmployeeUtils
    .deleteOrderEmployee(this.employeeToDelete.id)
    .subscribe({
      next: () => {
        this.isLoading = false;
        this.deleteProjectPackageEvent.emit({ status: 'success' });
        this.closeAndReset();
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.deleteProjectPackageEvent.emit({ status: 'error', error });
      }
    });
    this.subscriptions.add(sub);
  }
}