import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '../../../../Entities/customer';
import { CustomerService } from '../../../customer/services/customer.service';
import { TranslateService, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

interface Column {
  field: string,
  header: string
}


@Component({
  selector: 'app-projects-overview',
  standalone: false,
  providers: [MessageService, ConfirmationService, Customer, TranslatePipe, TranslateDirective],
  templateUrl: './projects-overview.component.html',
  styleUrl: './projects-overview.component.scss'
})
export class ProjectsOverviewComponent implements OnInit {

  public cols!: Column[];

  public selectedColumns!: Column[];

  public customers!: Customer[];

  private langSubscription!: Subscription;


  public typesCompany: any[] = [
    { name: 'Public', code: 'PB' },
    { name: 'Private', code: 'PR' },
    { name: 'Other', code: 'OT' }
  ]

  public sectors: any[] = [
    { name: 'Economic', code: 'EC' },
    { name: 'Financial', code: 'FI' },
    { name: 'Human Resources', code: 'HR' }
  ]

  public states: any[] = [
    { name: 'Bavaria', code: 'BY' },
    { name: 'Saxony', code: 'SN' },
    { name: 'Saarland', code: 'SL' }
  ]

  public formDetailCustomer!: FormGroup;

  public persons = [
    { id: 1, project_label: 'BL.DR', project_name: 'Blue Dragon', funding_program: 'Eagle', promoter : 'East Bank', funding_label: 'UnitedTeam', start_date:'12.10.2025', end_date:'05.04.2025', auth_date : '15.10.25', funding_rate:10 },
    { id: 2, project_label: 'SRC', project_name: 'Scorpion', funding_program: 'Falcons', promoter : 'TeachSolutions', funding_label: 'UnitedTeam', start_date:'03.01.2025', end_date:'30.03.2025', auth_date : '08.01.25', funding_rate: 7 },
    { id: 3, project_label: 'D.Z', project_name: 'DayZero', funding_program: 'Xtreme', promoter : 'HanoiComp', funding_label: 'Safe', start_date:'11.11.24', end_date:'04.04.25', auth_date: '06.04.25', funding_rate: 4},     
  ]                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
  
  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private customerService: CustomerService,
    private translate: TranslateService
  ) {

    this.formDetailCustomer = this.fb.group({
      customerNo: [123],
      companyText1: [''],
      companyText2: [''],
      selectedCountry: [''],
      street: [''],
      postalCode: [''],
      city: [''],
      selectedTypeCompany: [''],
      selectedSector: [''],
      selectedState: [''],
      homepage: [''],
      phone: [''],
      invoiceEmail: [''],
      weekWorkingHours: [''],
      taxNumber: [''],
      headcount: [''],
      maxHoursMonth: [''],
      maxHoursYear: [''],
      textAreaComment: [''],
    });
  }

  ngOnInit(): void {
    this.formDetailCustomer.get('customerNo')?.disable();
    this.customers = this.customerService.list();
    this.activatedRoute.params
      .subscribe(params => {
        const customerId = params['id'];
        if (customerId) {
          this.formDetailCustomer.get('customerNo')?.setValue(customerId);


        } else {
          this.formDetailCustomer.get('customerNo')?.setValue(this.customers.length + 1);
        }
      });

    this.langSubscription = this.translate.onLangChange.subscribe(() => {

    });

    //Init colums
    this.cols = [
      { field: 'project_label', header:  'Projekt' },
      { field: 'project_name', header: 'Langname' },
      { field: 'funding_program', header: 'Förd.Programm' },
      { field: 'promoter', header: 'Projektträger' },
      { field: 'funding_label', header: 'Förderkennzeichen' },
      { field: 'start_date', header: 'Start' },
      { field: 'end_date', header: 'Ende' },
      { field: 'auth_date', header: 'Förderkennzeichen' },
      { field: 'funding_rate', header: 'Fördersatz' }
      
    ];

    this.selectedColumns = this.cols;
  }




}
