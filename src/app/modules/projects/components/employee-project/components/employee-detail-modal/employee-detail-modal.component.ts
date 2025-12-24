import { Component, EventEmitter, Input, OnChanges, OnInit, Output, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EmployeeUtils } from '../../../../../customer/sub-modules/employee/utils/employee.utils';
import { Employee } from '../../../../../../Entities/employee';

@Component({
  selector: 'app-employee-detail-modal',
  standalone: false,
  templateUrl: './employee-detail-modal.component.html',
  styleUrl: './employee-detail-modal.component.scss'
})
export class EmployeeDetailModalComponent implements OnInit, OnChanges {
  private readonly employeeUtils = inject(EmployeeUtils);
  private subscriptions = new Subscription();

  @Input() modalType: 'create' | 'edit' | 'delete' = 'create';
  @Input() visibleModal: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();

  isLoading = false;
  projectId = '';
  employees: Employee[] = [];

  constructor(private readonly activatedRoute: ActivatedRoute) { }

  readonly createEmployeeDetailsForm = new FormGroup({
    employee: new FormControl(''),
    employeeNo: new FormControl<number | null>({ value: null, disabled: true }),
    hourlyrate: new FormControl(''),
    qualificationkmui: new FormControl('')
  });

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['idProject'];
    });
    this.loadEmployees();

    console.log(this.employees);
  }

  ngOnChanges(): void {

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
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
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
}