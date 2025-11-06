import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TypeOfCompaniesStateService } from '../../utils/types-of-companies.state.service';
import { CompanyType } from '../../../../../../Entities/companyType';
import { emptyValidator } from '../../utils/empty.validator';
import { CompanyTypeUtils } from '../../utils/type-of-companies.utils';
import { Subscription, take } from 'rxjs';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-types-of-companies-form',
  standalone: false,
  templateUrl: './types-of-companies-form.component.html',
  styleUrl: './types-of-companies-form.component.scss'
})
export class TypesOfCompaniesFormComponent implements OnInit, OnDestroy {
  companyType: CompanyType | null = null;
  companyTypeEditForm!: FormGroup;
  isSaving = false;
  nameAlreadyExist = false;
  public showOCCErrorModalCompanyType = false;
  private readonly subscriptions = new Subscription();
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  constructor(private readonly companyTypeServiceUtils: CompanyTypeUtils,
    private readonly typeOfCompanyStateService: TypeOfCompaniesStateService,
    private readonly commonMessageService: CommonMessagesService
  ) { }

  ngOnInit(): void {
    this.companyTypeEditForm = new FormGroup({
      name: new FormControl('', [Validators.required, emptyValidator()])
    });

    // Check if we need to load a company type after page refresh
    const savedCompanyTypeId = localStorage.getItem('selectedCompanyTypeId');
    if (savedCompanyTypeId) {
      this.loadCompanyTypeAfterRefresh(savedCompanyTypeId);
      localStorage.removeItem('selectedCompanyTypeId');
    }

    this.subscriptions.add(
      this.typeOfCompanyStateService.currentTypeOfCompany$.subscribe((companyType) => {
        if (companyType) {
          this.companyType = companyType;
          this.companyTypeEditForm.patchValue(companyType);
          this.focusInputIfNeeded();
          this.companyTypeEditForm.updateValueAndValidity();
        } else {
          this.clearForm();
        }
      })
    );
    this.companyTypeEditForm.get('name')?.valueChanges.subscribe(() => {
      if (this.nameAlreadyExist) {
        this.nameAlreadyExist = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  clearForm(): void {
    this.companyTypeEditForm.reset();
    this.companyType = null;
  }

  onCompanyTypeEditFormSubmit(): void {
    if (this.companyTypeEditForm.invalid || !this.companyType || this.isSaving) return;

    const name = this.companyTypeEditForm.value.name?.trim() ?? '';
    this.isSaving = true;
    this.nameAlreadyExist = false;

    this.companyTypeServiceUtils.companyTypeExists(name).pipe(take(1)).subscribe({
      next: (exists) => {
        if (exists && name.toLowerCase() !== this.companyType?.name.toLowerCase()) {
          this.commonMessageService.showErrorRecordAlreadyExist();
          this.nameAlreadyExist = true;
          this.isSaving = false;
          this.companyTypeEditForm.get('name')?.setErrors({ notUnique: true });
          this.focusInputIfNeeded();
          return;
        }

        const updatedCompanyType = { ...this.companyType!, name };
        this.saveCompanyType(updatedCompanyType);
      },
      error: (err) => {
        this.isSaving = false;
        this.commonMessageService.showErrorEditMessage();
        console.error('Error checking uniqueness:', err);
      }
    });
  }

  private saveCompanyType(companyType: CompanyType): void {
    this.companyTypeServiceUtils.updateCompanyType(companyType).pipe(take(1)).subscribe({
      next: () => this.handleSaveSuccess(),
      error: (err) => this.handleSaveError(err)
    });
  }

  private handleSaveSuccess(): void {
    this.isSaving = false;
    this.commonMessageService.showEditSucessfullMessage();
    this.typeOfCompanyStateService.setTypeOfCompanyTypeToEdit(null);
    this.clearForm();
  }

  private handleSaveError(error: any): void {
    this.isSaving = false;
    if (error instanceof OccError) {
      this.showOCCErrorModalCompanyType = true;
      this.occErrorType = error.errorType;
    }
    this.commonMessageService.showErrorEditMessage();
  }

  private loadCompanyTypeAfterRefresh(companyTypeId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.companyTypeServiceUtils.getCompanyTypeById(Number(companyTypeId)).subscribe({
        next: (companyType) => {
          if (companyType) {
            this.typeOfCompanyStateService.setTypeOfCompanyTypeToEdit(companyType);
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
    if (this.companyType?.id) {
      localStorage.setItem('selectedCompanyTypeId', this.companyType.id.toString());
      globalThis.location.reload();
    }
  }

  private focusInputIfNeeded(): void {
    if (this.companyType && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}