import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Country } from '../../../../../../Entities/country';
import { Subscription } from 'rxjs';
import { CountryStateService } from '../../utils/country-state.service';
import { CountryUtils } from '../../utils/country-util';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-country',
  templateUrl: './edit-country.component.html',
  styleUrls: ['./edit-country.component.scss'],
  standalone: false,
})
export class EditCountryComponent implements OnInit, OnDestroy {
  currentCountry: Country | null = null;
  countryForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  
  constructor(
    private readonly countryUtils: CountryUtils,
    private readonly countryStateService: CountryStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupCountrySubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.countryForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
      abbreviation: new FormControl('', [Validators.required, Validators.maxLength(10)]),
      isStandard: new FormControl(false)
    });
  }

  private setupCountrySubscription(): void {
    this.subscriptions.add(
      this.countryStateService.currentCountry$.subscribe(country => {
        this.currentCountry = country;
        country ? this.loadCountryData(country) : this.clearForm();
      })
    );
  }

  private loadCountryData(country: Country): void {
    this.countryForm.patchValue({
      name: country.name,
      abbreviation: country.label,
      isStandard: country.isDefault
    });
  }

  clearForm(): void {
    this.countryForm.reset();
    this.currentCountry = null;
    this.isSaving = false;
  }

  onSubmit(): void {
    if (this.countryForm.invalid || !this.currentCountry || this.isSaving) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updatedCountry: Country = {
      ...this.currentCountry,
      name: this.countryForm.value.name,
      label: this.countryForm.value.abbreviation,
      isDefault: this.countryForm.value.isStandard
    };

    this.subscriptions.add(
      this.countryUtils.updateCountry(updatedCountry).subscribe({
        next: () => this.handleSaveSuccess(),
        error: (err) => this.handleSaveError(err)
      })
    );
  }

  private handleSaveSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('COUNTRIES.MESSAGE.SUCCESS'),
      detail: this.translate.instant('COUNTRIES.MESSAGE.UPDATE_SUCCESS')
    });
    this.countryStateService.setCountryToEdit(null);
    this.clearForm();
  }

  private handleSaveError(error: any): void {
    console.error('Error saving country:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('COUNTRIES.MESSAGE.ERROR'),
      detail: this.translate.instant('COUNTRIES.MESSAGE.UPDATE_FAILED')
    });
    this.isSaving = false;
  }

  private markAllAsTouched(): void {
    Object.values(this.countryForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }
}