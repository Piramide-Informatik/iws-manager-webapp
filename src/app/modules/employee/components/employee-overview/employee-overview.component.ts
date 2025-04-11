import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Customer } from '../../../../Entities/customer';
import { Employee } from '../../../../Entities/Employee';
import { EmployeeService } from '../../services/employee.service';
import { ActivatedRoute, Router } from '@angular/router';


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
export class EmployeeOverviewComponent implements OnInit {
  public customer!: string;
  customers: Customer[] = [];
  employees: Employee[] = [];
  selectedCustomers!: WorkContract[] | null;
  selectedCustomer!: WorkContract[] | null;
  submitted: boolean = true;
  statuses!: any[];
  @ViewChild('dt2') dt2!: Table;
  loading: boolean = true;
  public cols!: Column[];

  //public cols!: Column[];

  public selectedColumns!: Column[];

  public filterCols!: Column[];

  public selectedFilterColumns!: Column[];


  constructor(private employeeService: EmployeeService, private router: Router) { }

  ngOnInit() {
    this.selectedColumns = this.cols;
    this.selectedFilterColumns = this.filterCols;

    this.employees = this.employeeService.getEmployees();
    this.loading = false;

    this.customer = 'Valentin Laime'

    //Init colums
    this.cols = [
      { field: 'id', header: 'Pers.Nr.' },
      { field: 'firstName', header: 'Vorname' },
      { field: 'lastName', header: 'Nachname' },
      { field: 'email', header: 'Email' },
      { field: 'generalManagerSince', header: 'GF' },
      { field: 'shareholderSince', header: 'Ges.' },
      { field: 'soleProprietorSince', header: 'EU' },
      { field: 'coEntrepreneurSince', header: 'MU' },
      { field: 'qualificationFz', header: 'Quali FZ' },
      { field: 'qualificationKmui', header: 'Quali KMU-i' }

    ];

    //Filter colums
    this.filterCols = [
      { field: 'id', header: 'Pers. Nr.' },
      { field: 'firstName', header: 'Vorname' },
      { field: 'lastName', header: 'Nachname' },
      { field: 'email', header: 'Email' }
    ];

    this.selectedColumns = this.cols;
    this.selectedFilterColumns = this.filterCols;
  }

  goToEmployeeDetails(currentEmployee: Employee) {
    this.router.navigateByUrl('/employees/employee-details', { state: { customer: "Valentin Laime", employee: currentEmployee } });
  }

  searchEmployee(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value) {
      this.dt2.filterGlobal(inputElement.value, 'contains');
    }
  }

  onInputChange(event: Event): void {

  }

  createEmployee() {
    this.router.navigateByUrl('/employees/employee-details');
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}
