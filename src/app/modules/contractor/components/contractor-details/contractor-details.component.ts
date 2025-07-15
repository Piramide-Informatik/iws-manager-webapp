import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { map } from 'rxjs';
import { CountryUtils } from '../../../master-data/components/countries/utils/country-util';
@Component({
  selector: 'app-contractor-details',
  standalone: false,
  templateUrl: './contractor-details.component.html',
  styleUrl: './contractor-details.component.scss'
})
export class ContractorDetailsComponent {

  private readonly countryUtils = inject(CountryUtils);
  countries = toSignal(
    this.countryUtils.getCountriesSortedByName().pipe(
      map(countries => countries.map(country => ({
        id: country.id,
        name: country.name
      })))
    )
  );
  public contractId!: number;
  public contractorForm!: FormGroup;
  @Input() contractor: any
  @Input() modalContractType: any;
  @Output() isContractVisibleModal = new EventEmitter<boolean>();

  constructor(
    private readonly fb: FormBuilder
  ) {
    this.contractorForm = this.fb.group({
      contractorlabel: [''],
      contractorname: [''],
      country: [''],
      street: [''],
      zipcode: [''],
      city: [''],
      taxno: ['']
    });
  }

  get isCreateContractorMode(): boolean {
    return this.modalContractType !== 'delete';
  }

  onSubmit() {
    if (this.contractorForm.valid) {
      if (this.contractId) {
        console.log('Update');
      } else {
        console.log('Create');
      }
    }
  }

  closeModal(): void {
    this.isContractVisibleModal.emit(false);
    this.contractorForm.reset();
  }
}
