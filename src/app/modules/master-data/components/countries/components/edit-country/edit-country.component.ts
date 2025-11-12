import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Country } from '../../../../../../Entities/country';
import { Subscription, take } from 'rxjs';
import { CountryStateService } from '../../utils/country-state.service';
import { CountryUtils } from '../../utils/country-util';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

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
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public showOCCErrorModalCountry = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public isLoading: boolean = false;
  public editNameAlreadyExist = false;
  public editAbbreviationAlreadyExist = false;

  constructor(
    private readonly countryUtils: CountryUtils,
    private readonly countryStateService: CountryStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
    private readonly commonMessageService: CommonMessagesService,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupCountrySubscription();
    // Check if we need to load a country after page refresh
    const savedCountryId = localStorage.getItem('selectedCountryId');
    if (savedCountryId) {
      this.loadCountryAfterRefresh(savedCountryId);
      localStorage.removeItem('selectedCountryId');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.countryForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      abbreviation: new FormControl('', [Validators.required]),
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
    this.focusInputIfNeeded();
  }

  clearForm(): void {
    this.countryForm.reset();
    this.currentCountry = null;
    this.isSaving = false;
    this.editNameAlreadyExist = false;
    this.editAbbreviationAlreadyExist = false;
  }

  onSubmit(): void {
    if (this.countryForm.invalid || !this.currentCountry || this.isSaving || this.editNameAlreadyExist || this.editAbbreviationAlreadyExist) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updatedCountry: Country = {
      ...this.currentCountry,
      name: this.countryForm.value.name?.trim(),
      label: this.countryForm.value.abbreviation?.trim(),
      isDefault: this.countryForm.value.isStandard
    };

    this.subscriptions.add(
      this.countryUtils.updateCountry(updatedCountry).subscribe({
        next: () => {
          this.isSaving = false;
          this.sendDefaultCountryMessage();
          this.clearForm();
          this.countryUtils.loadInitialData().subscribe();
          this.commonMessageService.showEditSucessfullMessage();
        },
        error: (error: Error) => {
          this.isSaving = false;
          if (error instanceof OccError) {
            console.log('OCC Error occurred:', error);
            this.showOCCErrorModalCountry = true;
            this.occErrorType = error.errorType;
            this.commonMessageService.showErrorEditMessage();
          } else if (error.message.includes('name already exists')) {
            this.editNameAlreadyExist = true;
            this.countryForm.get('name')?.valueChanges.pipe(take(1))
              .subscribe(() => this.editNameAlreadyExist = false);
            this.commonMessageService.showErrorEditMessage();
          } else if (error.message.includes('abbreviation already exists')) {
            this.editAbbreviationAlreadyExist = true;
            this.countryForm.get('abbreviation')?.valueChanges.pipe(take(1))
              .subscribe(() => this.editAbbreviationAlreadyExist = false);
            this.commonMessageService.showErrorEditMessage();
          } else {
            this.commonMessageService.showErrorEditMessage();
          }
        }
      })
    );
  }
  
  private sendDefaultCountryMessage(): void {
    const isDefaultCountry = this.countryForm.value?.isStandard!;
    if (isDefaultCountry === true) {
      this.commonMessageService.showCustomSeverityAndMessageWithValue(
        'warn',
        'COUNTRIES.MESSAGE.SUCCESS',
        'COUNTRIES.MESSAGE.DEFAULT_COUNTRY',
        this.countryForm.value.name?.toString(),
        true
      )
    }
  }

  private handleSaveSuccess(): void {
    this.commonMessageService.showEditSucessfullMessage();
    this.countryStateService.setCountryToEdit(null);
    this.clearForm();
  }

  private handleSaveError(error: any): void {
    console.error('Error saving country:', error);
    if (error instanceof Error && error.message?.includes('version mismatch')) {
      this.showOCCErrorModalCountry = true;
      this.isSaving = false;
      return;
    }
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('COUNTRIES.MESSAGE.ERROR'),
      detail: this.translate.instant('COUNTRIES.MESSAGE.UPDATE_FAILED')
    });
    this.isSaving = false;
  }

  private loadCountryAfterRefresh(countryId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.countryUtils.getCountryById(Number(countryId)).subscribe({
        next: (country) => {
          if (country) {
            this.countryStateService.setCountryToEdit(country);
          }
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      })
    );
  }

  onRefresh(): void {
    if (this.currentCountry?.id) {
      localStorage.setItem('selectedCountryId', this.currentCountry.id.toString());
      globalThis.location.reload();
    }
  }

  private markAllAsTouched(): void {
    for(const control of Object.values(this.countryForm.controls)){
      control.markAsTouched();
      control.markAsDirty();
    }
  }

  private focusInputIfNeeded(): void {
    if (this.currentCountry && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}