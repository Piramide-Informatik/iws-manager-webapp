import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

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
      nachname: new FormControl(''),
      vorname: new FormControl(''),
      anrede: new FormControl(''),
      titel: new FormControl(''),
      funktion: new FormControl(''),
      mailadresse: new FormControl(''),
      rechnungsempfänger: new FormControl('')
    });
  }
}

