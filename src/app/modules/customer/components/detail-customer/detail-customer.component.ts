import { Component } from '@angular/core';
import { FormBuilder, FormControlName, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-detail-customer',
  standalone: false,
  templateUrl: './detail-customer.component.html',
  styleUrl: './detail-customer.component.scss'
})
export class DetailCustomerComponent {

  public visibleDialogNewPerson: boolean = false;
  
  public countries: any[] = [
    { 
      name: 'Germany', 
      code: 'DE', 
      flag: 'https://flagsapi.com/DE/flat/64.png'  // Ejemplo con FlagsAPI
    },
    { 
      name: 'Switzerland', 
      code: 'CH', 
      flag: 'https://flagsapi.com/CH/flat/64.png' 
    },
    { 
      name: 'France', 
      code: 'FR', 
      flag: 'https://flagsapi.com/FR/flat/64.png' 
    },
    { 
      name: 'Japan', 
      code: 'JP', 
      flag: 'https://flagsapi.com/JP/flat/64.png' 
    }
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
    {
      name: 'Dr. Anna Müller',
      function: 'Chief Financial Officer',
      right: 'Authorized signatory'
    },
    {
      name: 'James Carter',
      function: 'Power of Attorney',
      right: 'Granted full decision-making'
    },
    {
      name: 'Elena Petrova',
      function: 'Head of Data Protection',
      right: 'Certified to issue GDPR'
    },
    {
      name: 'Dr. Anna Müller',
      function: 'Chief Financial Officer',
      right: 'Authorized signatory'
    },
    {
      name: 'James Carter',
      function: 'Power of Attorney',
      right: 'Granted full decision-making'
    },
    {
      name: 'Elena Petrova',
      function: 'Head of Data Protection',
      right: 'Certified to issue GDPR'
    },
    {
      name: 'Dr. Anna Müller',
      function: 'Chief Financial Officer',
      right: 'Authorized signatory'
    },
    {
      name: 'James Carter',
      function: 'Power of Attorney',
      right: 'Granted full decision-making'
    },
    {
      name: 'Elena Petrova',
      function: 'Head of Data Protection',
      right: 'Certified to issue GDPR'
    },
    {
      name: 'Dr. Anna Müller',
      function: 'Chief Financial Officer',
      right: 'Authorized signatory'
    },
    {
      name: 'James Carter',
      function: 'Power of Attorney',
      right: 'Granted full decision-making'
    },
    {
      name: 'Elena Petrova',
      function: 'Head of Data Protection',
      right: 'Certified to issue GDPR'
    },
  ]

  constructor(private fb: FormBuilder){

    this.formDetailCustomer = this.fb.group({
      customerNo: [],
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

  deletePerson(contact: any){
    this.persons = this.persons.filter(person => person.name !== contact.name); 
  }

  addNewPerson(name: string, functionPerson: string, right: string){
    this.visibleDialogNewPerson = false;
    const newPerson = {
      name,
      function: functionPerson,
      right
    }
    this.persons.push(newPerson);
  }

  showDialog() {
    this.visibleDialogNewPerson = true;
  }

}
