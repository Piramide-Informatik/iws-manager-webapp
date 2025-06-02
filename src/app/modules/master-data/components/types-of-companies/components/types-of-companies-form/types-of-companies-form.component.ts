import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TypeOfCompaniesStateService } from '../../utils/types-of-companies.state.service';
import { CompanyType } from '../../../../../../Entities/companyType';
import { emptyValidator } from '../../utils/empty.validator';
import { CompanyTypeUtils } from '../../utils/type-of-companies.utils';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-types-of-companies-form',
  standalone: false,
  templateUrl: './types-of-companies-form.component.html',
  styleUrl: './types-of-companies-form.component.scss'
})
export class TypesOfCompaniesFormComponent implements OnInit {

  companyType: CompanyType| null = null;
  companyTypeForm!: FormGroup;
  isSaving = false;
  constructor( private readonly companyTypeServiceUtils: CompanyTypeUtils,
               private readonly typeOfCompanyStateService: TypeOfCompaniesStateService,
               private readonly messageService: MessageService,
               private readonly translate: TranslateService
   ){ }

  ngOnInit(): void {
    this.companyTypeForm = new FormGroup({
      name: new FormControl('', [Validators.required, emptyValidator()])
    });
    this.typeOfCompanyStateService.currentTypeOfCompany$.subscribe((companyType) => {
      if (companyType !== null) {
        this.companyType = companyType;
        this.companyTypeForm.patchValue(companyType);
        this.companyTypeForm.updateValueAndValidity();
      }
    })
  }

  clearForm(): void {
    this.companyTypeForm.reset();
    this.companyType = null;
    this.isSaving = false;
  }

  onCompanyTypeFormSubmit(): void {
    if (this.companyTypeForm.invalid || !this.companyType || this.isSaving) {
      this.markAllFieldsAsTouched();
      return;
    }
    this.isSaving = true;
    const companyType = Object.assign(this.companyType, this.companyTypeForm.value);
    this.companyTypeServiceUtils.updateCompanyType(companyType).subscribe({
      next: (savedCompanyType) => this.handleSaveSuccess(savedCompanyType),
      error: (err) => this.handleSaveError(err)
    })
  }

  private handleSaveSuccess(savedCompanyType: CompanyType): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('TYPE_OF_COMPANIES.MESSAGE.SUCCESS'),
      detail: this.translate.instant('TYPE_OF_COMPANIES.MESSAGE.UPDATE_SUCCESS')
    });
    this.typeOfCompanyStateService.setTypeOfCompanyTypeToEdit(null);
    this.clearForm();
  }

  private handleSaveError(error: any): void {
    console.error('Error saving companyType:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('TYPE_OF_COMPANIES.MESSAGE.ERROR'),
      detail: this.translate.instant('TYPE_OF_COMPANIES.MESSAGE.UPDATE_FAILED')
    });
    this.isSaving = false;
  }

  private markAllFieldsAsTouched(): void {
    Object.values(this.companyTypeForm.controls).forEach(controlForm => {
      controlForm.markAsTouched();
      controlForm.markAsDirty();
    });
  }
}