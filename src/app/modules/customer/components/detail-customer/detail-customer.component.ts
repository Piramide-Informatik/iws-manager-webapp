import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-detail-customer',
  standalone: false,
  templateUrl: './detail-customer.component.html',
  styleUrl: './detail-customer.component.scss'
})
export class DetailCustomerComponent implements OnInit {

  public visibleDialogNewPerson: boolean = false;
  
  public countries: any[] = [
    { 
      name: 'Germany', 
      code: 'DE', 
      flag: 'https://flagsapi.com/DE/flat/64.png'
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
      id: 1,
      name: 'Dr. Anna Müller',
      function: 'Chief Financial Officer',
      right: 'Authorized signatory'
    },
    {
      id: 2,
      name: 'James Carter',
      function: 'Power of Attorney',
      right: 'Granted full decision-making'
    },
    {
      id: 3,
      name: 'Elena Petrova',
      function: 'Head of Data Protection',
      right: 'Certified to issue GDPR'
    },
    {
      id: 4,
      name: "Marcus Holloway",
      function: "Cybersecurity Specialist",
      right: "Access to mainframe encryption keys"
    },
    {
      id: 5,
      name: "Eliza Chen",
      function: "Biomedical Researcher",
      right: "Authorization for Level 4 lab access"
    },
    {
      id: 6,
      name: "Darius Johnson",
      function: "Urban Planner",
      right: "Approval authority for zoning changes"
    },
    {
      id: 7,
      name: "Sophia Rivera",
      function: "Federal Judge",
      right: "Judicial override capability"
    },
    {
      id: 8,
      name: "Trevor O'Neil",
      function: "Power Grid Operator",
      right: "Emergency load shedding privileges"
    },
    {
      id: 9,
      name: "Priya Patel",
      function: "Pharmaceutical Director",
      right: "Experimental drug approval"
    },
    {
      id: 10,
      name: "Jamal Washington",
      function: "Air Traffic Controller",
      right: "Priority flight rerouting"
    },
    {
      id: 11,
      name: "Natalie Brooks",
      function: "Meteorology Chief",
      right: "Emergency broadcast access"
    },
    {
      id: 12,
      name: "Connor Shaw",
      function: "FBI Field Agent",
      right: "Bypass local jurisdiction"
    },
    {
      id: 13,
      name: "Isabella Morales",
      function: "Water Treatment Manager",
      right: "Chemical dosage override"
    },
    {
      id: 14,
      name: "Ethan Zhang",
      function: "Stock Exchange Analyst",
      right: "Trading halt authorization"
    },
    {
      id: 15,
      name: "Olivia Kensington",
      function: "Nuclear Engineer",
      right: "Reactor safety protocols override"
    },
    {
      id: 16,
      name: "Miguel Alvarez",
      function: "Border Patrol Supervisor",
      right: "Temporary checkpoint establishment"
    },
    {
      id: 17,
      name: "Avery Sinclair",
      function: "CDC Epidemiologist",
      right: "Mandatory quarantine declaration"
    },
    {
      id: 18,
      name: "Jasmine Williams",
      function: "Federal Reserve Economist",
      right: "Emergency fund release"
    },
    {
      id: 19,
      name: "Caleb Donovan",
      function: "NASA Flight Director",
      right: "Mission abort decision"
    },
    {
      id: 20,
      name: "Violet Chang",
      function: "Social Media CTO",
      right: "Information flow control"
    }
  ]

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute
  ){

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
    this.activatedRoute.params
    .subscribe( params => {
      const customerId = params['id'];
      if(customerId){
        this.formDetailCustomer.get('customerNo')?.disable();
        this.formDetailCustomer.get('customerNo')?.setValue(customerId);

        
      }
    });
  }

  deletePerson(contact: any){
    this.persons = this.persons.filter(person => person.id !== contact.id); 
  }

  addNewPerson(name: string, functionPerson: string, right: string){
    this.visibleDialogNewPerson = false;
    const newPerson = {
      id: this.persons.length + 1,
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
