import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validator } from '@angular/forms';

@Component({
  selector: 'app-contact',
  standalone: false,
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {

  contactForm: FormGroup;

  constructor() {
    this.contactForm = new FormGroup({
      lastname: new FormControl(''),
      firstname: new FormControl(''),
      salutation: new FormControl(''),
      title: new FormControl(''),
      position: new FormControl(''),
      emailaddress: new FormControl(''),
      invoicerecipient: new FormControl('')
    });
  }
  save() {
    console.log('Guardando datos:', this.contactForm.value);
  }

  cancel() {
    console.log('Cancelando operación');
    this.contactForm.reset();
  }
}

