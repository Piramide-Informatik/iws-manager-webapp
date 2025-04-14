import { Component, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-contractor-details',
  standalone: false,
  templateUrl: './contractor-details.component.html',
  styleUrl: './contractor-details.component.scss'
})
export class ContractorDetailsComponent {

  customer = signal('');
  contractorLabel = signal('');
  contractorName = signal('');
  countryname = signal('DE');
  street = signal('');
  zipcode = signal('');
  city = signal('');
  taxNumber = signal('');

  fields = [
    { id: 'customer', label: 'Kunde', model: this.customer },
    { id: 'contractorLabel', label: 'Kurzname', model: this.contractorLabel },
    { id: 'contractorName', label: 'Name', model: this.contractorName },
    { id: 'countryname', label: 'Land', model: this.countryname },
    { id: 'street', label: 'Straße', model: this.street },
    { id: 'zipcode', label: 'PLZ', model: this.zipcode },
    { id: 'city', label: 'Ort', model: this.city },
    { id: 'taxNumber', label: 'USt.-ID', model: this.taxNumber },
  ];

  countries = [
    { label: 'Deutschland', value: 'DE' },
    { label: 'Österreich', value: 'AT' },
    { label: 'Schweiz', value: 'CH' },
  ];

  isFormValid = computed(() =>
    this.customer().trim().length > 0 &&
    this.contractorLabel().trim().length > 0 &&
    this.contractorName().trim().length > 0
  );

  constructor(private readonly router: Router) {}

  onSubmit() {
    if (!this.isFormValid()) {
      alert('Bitte fülle alle Pflichtfelder aus.');
      return;
    }

    let contractor = {
      customer: this.customer(),
      contractorLabel: this.contractorLabel(),
      contractorName: this.contractorName(),
      countryname: this.countryname(),
      street: this.street(),
      zipcode: this.zipcode(),
      city: this.city(),
      taxNumber: this.taxNumber()
    };
  }

  onDelete() {
    for (const field of this.fields) {
      if (field.id !== 'customer') {
        field.model.set('');
      }
    }
  }
  onCancel() {
    this.router.navigate(['/contractors']);
  }
}
