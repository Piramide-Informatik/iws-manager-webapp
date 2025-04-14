import { Component, OnInit, Input, Output } from '@angular/core';
import { MessageService, SelectItem } from 'primeng/api';
import { EmployeeContract } from '../../models/employee-contract';
import { EmployeeContractService } from '../../services/employee-contract.service';
import { ActivatedRoute, Router, NavigationStart } from '@angular/router';
import { Salutation } from '../../models/salutation';
import { Title } from '../../models/title';
import { QualificationFZ } from '../../models/qualification-fz';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import {TranslateService, _} from "@ngx-translate/core";
import {TranslatePipe, TranslateDirective} from "@ngx-translate/core";

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

  salutations: Salutation[] | undefined;

  qualificationsFZ: QualificationFZ[] | undefined;

  employeeContracts!: EmployeeContract[];

  statuses!: SelectItem[];

  clonedEmployeeContracts: { [s: string]: EmployeeContract } = {};

  orderForm!: FormGroup;

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

  constructor(private employeeContractService: EmployeeContractService, private messageService: MessageService,
    private router: Router, private activatedRoute: ActivatedRoute) {
    //console.log(this.router.getCurrentNavigation().extras.state);
  }

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

    /** 
    this.orderForm = new FormGroup({
      customerName: new FormControl('', [Validators.required]),
      employeeNumber: new FormControl('', [Validators.required]),
      salutationId: new FormControl('', [Validators.required]),
      titleId: new FormControl('', [Validators.required]),
      employeeFirstName: new FormControl('', [Validators.required]),
      employeeLastName: new FormControl('', [Validators.required]),
      employeeEmail: new FormControl('', [Validators.required]),
      generalManagerSinceDate: new FormControl('', [Validators.required]),
      shareholderSinceDate: new FormControl('', [Validators.required]),
      solePropietorSinceDate: new FormControl('', [Validators.required]),
      coentrepreneurSinceDate: new FormControl('', [Validators.required]),
      qualificationFzId: new FormControl('', [Validators.required]),
      qualificationKMUi: new FormControl('', [Validators.required])
    });
*/
    this.salutations = [
      { id: 1, name: 'Frau', description: 'Men' },
      { id: 2, name: 'Herr', description: 'Women' },

    ];

    this.titles = [
      { id: 1, name: 'Dr.', description: 'title' },
      { id: 2, name: 'Prof.', description: 'title' },
      { id: 3, name: 'Prof. Doc.', description: 'title' }

    ];


    this.qualificationsFZ = [
      { id: 1, name: 'Micro', description: 'title' },
      { id: 2, name: 'Small', description: 'title' },
      { id: 3, name: 'Medium', description: 'title' }

    ];

    //Init colums
    this.cols = [
      { field: 'startDate', header: 'Datum' },
      { field: 'salaryPerMonth', header: 'Gehalt' },
      { field: 'hoursPerWeek', header: 'WoStd' },
      { field: 'workShortTime', header: 'Kurz' },
      { field: 'maxHoursPerMonth', header: 'Max. Std Mon' },
      { field: 'maxHoursPerDay', header: 'Max. Std Tag' },
      { field: 'hourlyRate', header: 'Std.Satz' },
      { field: 'specialPayment', header: 'JaZoSa' }
    ];

    this.selectedColumns = this.cols;
  }



}
