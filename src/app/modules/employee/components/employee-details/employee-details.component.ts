import { Component, OnInit, Input, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService, SelectItem } from 'primeng/api';
import { EmployeeContract } from '../../models/employee-contract';
import { EmployeeContractService } from '../../services/employee-contract.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '../../models/title';
import { QualificationFZ } from '../../models/qualification-fz';
import { FormGroup } from '@angular/forms';
import { TranslatePipe, TranslateDirective, TranslateService, _ } from "@ngx-translate/core";
import { SalutationService } from '../../../../Services/salutation.service';
import { map, Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-employee-details',
  standalone: false,
  providers: [MessageService, EmployeeContractService, TranslatePipe, TranslateDirective],
  templateUrl: './employee-details.component.html',
  styleUrl: './employee-details.component.scss'
})
export class EmployeeDetailsComponent implements OnInit {

  public cols!: Column[];
  public selectedColumns!: Column[];
  titles: Title[] | undefined;
  qualificationsFZ: QualificationFZ[] | undefined;
  employeeContracts!: EmployeeContract[];
  statuses!: SelectItem[];
  clonedEmployeeContracts: { [s: string]: EmployeeContract } = {};
  orderForm!: FormGroup;
  userEmployeeDetailPreferences: UserPreference = {};
  tableKey: string = 'EmployeeDetails'
  dataKeys = ['startDate', 'salaryPerMonth', 'hoursPerWeek', 'workShortTime', 'maxHoursPerMonth', 'maxHoursPerDay', 'hourlyRate', 'specialPayment'];


  private readonly salutationService = inject(SalutationService);

  public salutations = toSignal(
    this.salutationService.getAllSalutations().pipe(
      map(salutations => salutations.map(salutation => ({
        name: salutation.name,
        code: salutation.id
      })))
    ),
    { initialValue: [] }
  );

  @Input() customerName!: string | undefined;
  @Input() employeeNumber!: string | undefined;
  @Input() salutationId!: string | undefined;
  @Input() titleId!: string | undefined;
  @Input() employeeFirstName!: string | undefined;
  @Input() employeeLastName!: string | undefined;
  @Input() employeeEmail!: string;
  @Input() generalManagerSinceDate!: string;
  @Input() shareholderSinceDate!: string;
  @Input() solePropietorSinceDate!: string;
  @Input() coentrepreneurSinceDate!: string;
  @Input() qualificationFzId!: string;
  @Input() qualificationKMUi!: string;
  searchText: string = '';
  nextId: number = 1;
  private langSubscription!: Subscription;

  constructor(
    private readonly employeeContractService: EmployeeContractService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {

    this.customerName = history.state.customer;
    this.employeeNumber = history.state.employee.id;
    this.salutationId = history.state.employee.salutation;
    this.titleId = history.state.employee.title;
    this.employeeFirstName = history.state.employee.firstName;
    this.employeeLastName = history.state.employee.lastName;
    this.employeeEmail = history.state.employee.email;
    this.generalManagerSinceDate = history.state.employee.generalManagerSince;
    this.shareholderSinceDate = history.state.employee.shareholderSince;
    this.solePropietorSinceDate = history.state.employee.soleProprietorSince;
    this.coentrepreneurSinceDate = history.state.employee.coEntrepreneurSince;
    this.qualificationFzId = history.state.employee.qualificationFz;
    this.qualificationKMUi = history.state.employee.qualificationKmui;

    this.employeeContractService.getEmployeeContractsData().then((data) => {
      this.employeeContracts = data;
    });


    this.titles = [
      { id: 0, name: '', description: '' },
      { id: 1, name: 'Dr.', description: 'title' },
      { id: 2, name: 'Prof.', description: 'title' },
      { id: 3, name: 'Prof. Doc.', description: 'title' }
    ];

    this.qualificationsFZ = [
      { id: 1, name: 'Micro', description: 'title' },
      { id: 2, name: 'Small', description: 'title' },
      { id: 3, name: 'Medium', description: 'title' }
    ];

    this.loadEmployeeContractColumns();

    this.selectedColumns = this.cols;
    this.userEmployeeDetailPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadEmployeeContractColumns();
      this.selectedColumns = this.cols;
      this.userEmployeeDetailPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  onUserEmployeeDetailPreferencesChanges(userEmployeeDetailPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userEmployeeDetailPreferences));
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  loadEmployeeContractColumns() {
    this.cols = [
      { field: 'startDate', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.START_DATE')) },
      { field: 'salaryPerMonth', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.SALARY_PER_MONTH')) },
      { field: 'hoursPerWeek', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.WEEKLY_HOURS')) },
      { field: 'workShortTime', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.WORK_SHORT_TIME')) },
      { field: 'maxHoursPerMonth', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.MAX_HOURS_PER_MONTH')) },
      { field: 'maxHoursPerDay', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.MAX_HOURS_PER_DAY')) },
      { field: 'hourlyRate', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.HOURLY_RATE')) },
      { field: 'specialPayment', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.SPECIAL_PAYMENT')) }
    ];
  }
}
