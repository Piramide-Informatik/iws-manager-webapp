import { Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '../../../../Entities/customer';
import { CustomerService } from '../../services/customer.service';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-detail-customer',
  standalone: false,
  templateUrl: './detail-customer.component.html',
  styleUrl: './detail-customer.component.scss'
})
export class DetailCustomerComponent implements OnInit {

  public selectedCountry!: string;

  public cols!: Column[];

  public selectedColumns!: Column[];

  public customers!: Customer[];

  public countries: any[] = [
    { name: 'Germany', code: 'DE', flag: 'https://flagsapi.com/DE/flat/64.png' },
    { name: 'Switzerland', code: 'CH', flag: 'https://flagsapi.com/CH/flat/64.png' },
    { name: 'France', code: 'FR', flag: 'https://flagsapi.com/FR/flat/64.png' },
    { name: 'Japan', code: 'JP', flag: 'https://flagsapi.com/JP/flat/64.png' },
    { name: 'USA', code: 'US', flag: 'https://flagsapi.com/US/flat/64.png' },
    { name: 'UK', code: 'GB', flag: 'https://flagsapi.com/GB/flat/64.png' },
    { name: 'Canada', code: 'CA', flag: 'https://flagsapi.com/CA/flat/64.png' },
    { name: 'Spain', code: 'ES', flag: 'https://flagsapi.com/ES/flat/64.png' },
    { name: 'Italy', code: 'IT', flag: 'https://flagsapi.com/IT/flat/64.png' },
    { name: 'Netherlands', code: 'NL', flag: 'https://flagsapi.com/NL/flat/64.png' },
    { name: 'India', code: 'IN', flag: 'https://flagsapi.com/IN/flat/64.png' },
    { name: 'Brazil', code: 'BR', flag: 'https://flagsapi.com/BR/flat/64.png' },
    { name: 'Mexico', code: 'MX', flag: 'https://flagsapi.com/MX/flat/64.png' },
    { name: 'Argentina', code: 'AR', flag: 'https://flagsapi.com/AR/flat/64.png' },
    { name: 'South Korea', code: 'KR', flag: 'https://flagsapi.com/KR/flat/64.png' },
    { name: 'Australia', code: 'AU', flag: 'https://flagsapi.com/AU/flat/64.png' },
    { name: 'Russia', code: 'RU', flag: 'https://flagsapi.com/RU/flat/64.png' }
  ];


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
    { id: 1, name: 'Dr. Anna Müller', function: 'Chief Financial Officer', right: 1 },
    { id: 2, name: 'James Carter', function: 'Power of Attorney', right: 1 },
    { id: 3, name: 'Elena Petrova', function: 'Head of Data Protection', right: 1 },
    { id: 4, name: "Marcus Holloway", function: "Cybersecurity Specialist", right: 0 },
    { id: 5, name: "Eliza Chen", function: "Biomedical Researcher", right: 1 },
    { id: 6, name: "Darius Johnson", function: "Urban Planner", right: 1 },
    { id: 7, name: "Sophia Rivera", function: "Federal Judge", right: 0 },
    { id: 8, name: "Trevor O'Neil", function: "Power Grid Operator", right: 1 },
    { id: 9, name: "Priya Patel", function: "Pharmaceutical Director", right: 1 },
    { id: 10, name: "Jamal Washington", function: "Air Traffic Controller", right: 1 },
    { id: 11, name: "Natalie Brooks", function: "Meteorology Chief", right: 1 },
    { id: 12, name: "Connor Shaw", function: "FBI Field Agent", right: 0 },
    { id: 13, name: "Isabella Morales", function: "Water Treatment Manager", right: 1 },
    { id: 14, name: "Ethan Zhang", function: "Stock Exchange Analyst", right: 1 },
    { id: 15, name: "Olivia Kensington", function: "Nuclear Engineer", right: 1 },
    { id: 16, name: "Miguel Alvarez", function: "Border Patrol Supervisor", right: 1 },
    { id: 17, name: "Avery Sinclair", function: "CDC Epidemiologist", right: 1 },
    { id: 18, name: "Jasmine Williams", function: "Federal Reserve Economist", right: 1 },
    { id: 19, name: "Caleb Donovan", function: "NASA Flight Director", right: 1 },
    { id: 20, name: "Violet Chang", function: "Social Media CTO", right: 1 }
  ]

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private customerService: CustomerService
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

  visible: boolean = false;

  ngOnInit(): void {
    this.formDetailCustomer.get('customerNo')?.disable();
    this.customers = this.customerService.list();

    this.selectedCountry = (history.state.customerData.land);
    this.activatedRoute.params
      .subscribe(params => {
        const customerId = params['id'];
        this.formDetailCustomer.get('customerNo')?.setValue(history.state.customerData.id) ;
        this.formDetailCustomer.get('companyText1')?.setValue(history.state.customerData.companyName) ;
        this.formDetailCustomer.get('companyText2')?.setValue(history.state.customerData.nameLine2) ;
        this.formDetailCustomer.get('selectedCountry')?.setValue(this.countries[1]) ;
        this.formDetailCustomer.get('selectedTypeCompany')?.setValue(history.state.customerData.kind) ;
        this.formDetailCustomer.get('city')?.setValue(history.state.customerData.place) ;
        this.formDetailCustomer.get('invoiceEmail')?.setValue(history.state.customerData.contact) ;
      })

    //Init colums
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'function', header: 'Funktion' },
      { field: 'right', header: 'Rech' },
    ];

    this.selectedColumns = this.cols;
  }

  deletePerson(contact: any) {
    this.persons = this.persons.filter(person => person.id !== contact.id);
  }

  addNewPerson() {

  }

  showDialog() {
    this.visible = true;
  }

}
