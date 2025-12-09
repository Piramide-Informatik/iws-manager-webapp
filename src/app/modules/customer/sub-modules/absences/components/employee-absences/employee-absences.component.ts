import { Component, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '../../../../../../Entities/customer';
import { CustomerStateService } from '../../../../utils/customer-state.service';
import { of, Subscription, switchMap, take, tap } from 'rxjs';
import { CustomerUtils } from '../../../../utils/customer-utils';
import moment from 'moment';
import { EmployeeUtils } from '../../../employee/utils/employee.utils';
import { Employee } from '../../../../../../Entities/employee';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-employee-absences',
  standalone: false,
  templateUrl: './employee-absences.component.html',
  styleUrl: './employee-absences.component.scss'
})
export class EmployeeAbsencesComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly customerStateService = inject(CustomerStateService);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly employeeUtils = inject(EmployeeUtils);
  private readonly customerId: number = this.route.snapshot.params['id'];
  private readonly subscriptions = new Subscription();

  currentCustomer!: Customer;
  employees: Signal<Employee[] | undefined> = toSignal(
    this.employeeUtils.getAllEmployeesByCustomerId(this.customerId)
  );
  years: number[] = [];
  formYearEmployee!: FormGroup;

  ngOnInit(): void {
    this.initForm();
    this.getCurrentCustomer();
    this.getYears();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.formYearEmployee = new FormGroup ({
      year: new FormControl(moment().year()),
      employeeno: new FormControl(),
      employeeFullName: new FormControl({ value: '', disabled: true })
    });

    this.subscriptions.add(
      this.formYearEmployee.get('employeeno')?.valueChanges.subscribe((employeeId: number | null) => {
        if(employeeId){
          const employeeSelected = this.employees()?.find(e => e.id === employeeId);
          if (employeeSelected) {
            const fullName = `${employeeSelected.firstname} ${employeeSelected.lastname}`.trim();
            this.formYearEmployee.patchValue({
              employeeFullName: fullName
            }, { emitEvent: false }); 
          }
        } else {
          this.formYearEmployee.patchValue({
            employeeFullName: ''
          }, { emitEvent: false });
        }
      })
    );
  }

  private getCurrentCustomer(): void {
    if (!this.customerId || Number.isNaN(this.customerId)) return;
    
    this.customerStateService.currentCustomer$.pipe(
      take(1),
      switchMap(customerFromState => {
        // Verificar si el customer del state es el mismo que necesitamos
        if (customerFromState && customerFromState.id === this.customerId) {
          return of(customerFromState);
        }
        // Si no, obtener del backend
        return this.customerUtils.getCustomerById(this.customerId);
      }),
      tap(customer => {
        if (customer) {
          this.currentCustomer = customer;
          this.customerStateService.setCustomerToEdit(customer);
        }
      })
    ).subscribe({
      error: (error) => console.error('Error:', error)
    });
  }

  private getYears(): void {
    const startYear = 2016;
    const currentYear = moment().year();
    const endYear = currentYear + 5;
    
    for (let year = startYear; year <= endYear; year++) {
      this.years.push(year);
    }
  }

}
