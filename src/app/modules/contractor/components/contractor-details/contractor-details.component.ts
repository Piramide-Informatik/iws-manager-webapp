import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { map } from 'rxjs';
import { CountryUtils } from '../../../master-data/components/countries/utils/country-util';
import { ContractorUtils } from '../../utils/contractor-utils';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-contractor-details',
  standalone: false,
  templateUrl: './contractor-details.component.html',
  styleUrl: './contractor-details.component.scss'
})
export class ContractorDetailsComponent {

  contractorUtils = inject(ContractorUtils)
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
  @Output() onContractorDeleted = new EventEmitter<number>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
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

  removeContractor() {
    this.contractorUtils.deleteContractor(this.contractor).subscribe({
      next: () => {
        this.isContractVisibleModal.emit(false);
        this.onContractorDeleted.emit(this.contractor);
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('MESSAGE.SUCCESS'),
          detail: this.translate.instant('MESSAGE.DELETE_SUCCESS')
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('MESSAGE.ERROR'),
          detail: this.translate.instant('MESSAGE.DELETE_FAILED')
        });
      }
    })
  }
}
