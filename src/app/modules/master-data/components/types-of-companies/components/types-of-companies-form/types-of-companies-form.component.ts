import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TypeOfCompaniesStateService } from '../../utils/types-of-companies.state.service';
import { CompanyType } from '../../../../../../Entities/companyType';
import { emptyValidator } from '../../utils/empty.validator';
import { CompanyTypeUtils } from '../../utils/type-of-companies.utils';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

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
  public showOCCErrorModalCompanyType = false;
  private readonly subscriptions = new Subscription();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  constructor(private readonly companyTypeServiceUtils: CompanyTypeUtils,
    private readonly typeOfCompanyStateService: TypeOfCompaniesStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
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

    this.isSaving = true;
    const companyTypeEditFormValue = this.companyTypeEditForm.value;
    companyTypeEditFormValue.name = companyTypeEditFormValue.name?.trim();
    const companyType = Object.assign(this.companyType, companyTypeEditFormValue);

    this.subscriptions.add(
      this.companyTypeServiceUtils.updateCompanyType(companyType).subscribe({
        next: () => this.handleSaveSuccess(),
        error: (err) => this.handleSaveError(err)
      })
    );
  }

  private handleSaveSuccess(): void {
    this.isSaving = false;
    this.commonMessageService.showEditSucessfullMessage();
    this.typeOfCompanyStateService.setTypeOfCompanyTypeToEdit(null);
    this.clearForm();
  }

  private handleSaveError(error: any): void {
    this.isSaving = false;
    console.error('Error saving companyType:', error);
    if (error instanceof Error && error.message?.includes('version mismatch')) {
      this.showOCCErrorModalCompanyType = true;
      return;
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