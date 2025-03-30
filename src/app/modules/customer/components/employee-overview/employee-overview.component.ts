import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Customer } from '../../../../Entities/customer';
import { Employee } from '../../../../Entities/Employee';
import { EmployeeService } from '../../services/employee/employee.service';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-employee-overview',
  standalone: false,
  providers: [MessageService, ConfirmationService, Customer, Employee],
  templateUrl: './employee-overview.component.html',
  styleUrl: './employee-overview.component.scss'
})
export class EmployeeOverviewComponent {
  customers: Customer[] = [];
  employees: Employee[] = [];
  selectedCustomers!: WorkContract[] | null;
  selectedCustomer!: WorkContract[] | null;
  submitted: boolean = true;
  statuses!: any[];
  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  cols!: Column[];

  constructor( private employeeService: EmployeeService ){ }

  ngOnInit() {
    this.employees = this.employeeService.getEmployees();
    this.loading = false;
  }

  searchEmployee(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }

  onInputChange(event: Event): void {
  }

  createEmployee(){}
}
