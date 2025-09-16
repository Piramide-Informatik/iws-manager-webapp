import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { Vat } from '../../../../../../Entities/vat';
import { VatRate } from '../../../../../../Entities/vatRate';
import { VatUtils } from '../../utils/vat-utils';
import { VatStateService } from '../../utils/vat-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Column } from '../../../../../../Entities/column';

@Component({
  selector: 'app-sales-tax-form',
  standalone: false,
  templateUrl: './sales-tax-form.component.html',
  styleUrl: './sales-tax-form.component.scss'
})
export class SalesTaxFormComponent implements OnInit, OnDestroy {
  private readonly vatUtils = inject(VatUtils);
  private readonly vatStateService = inject(VatStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly translate = inject(TranslateService);
  public vatToEdit: Vat | null = null;
  public showOCCErrorModalVat = false;
  public isLoading: boolean = false;
  public editSalesTaxForm!: FormGroup;

  // Configure table VatRate (SalesTaxRate)
  salesTaxRatesValues!: VatRate[];
  salesTaxRatesColumns: Column[] = [];
  userSalesTaxFormPreferences: UserPreference = {};
  tableKey: string = 'SalesTaxForm'
  dataKeys = ['fromDate', 'rate'];

  private langSalesTaxRateSubscription!: Subscription;

  ngOnInit(): void {
    this.editSalesTaxForm = new FormGroup({
      label: new FormControl('')
    });
    this.setupVatSubscription();
    // Check if we need to load an vat after page refresh for OCC
    const savedVatId = localStorage.getItem('selectedVatId');
    if (savedVatId) {
      this.loadVatAfterRefresh(savedVatId);
      localStorage.removeItem('selectedVatId');
    }

    this.loadSalesTaxRateHeadersAndColumns();
    this.userSalesTaxFormPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.salesTaxRatesColumns);
    this.langSalesTaxRateSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadSalesTaxRateHeadersAndColumns();
      this.userSalesTaxFormPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.salesTaxRatesColumns);
    });
    this.salesTaxRatesValues = [];
  }

  onUserSalesTaxFormPreferencesChanges(userSalesTaxFormPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userSalesTaxFormPreferences));
  }

  ngOnDestroy() : void {
    if (this.langSalesTaxRateSubscription) {
      this.langSalesTaxRateSubscription.unsubscribe();
    }
    this.subscriptions.unsubscribe();
  }


  loadSalesTaxRateHeadersAndColumns() {
    this.salesTaxRatesColumns = [
      { field: 'fromDate', minWidth: 110, type: 'date', header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX_FORM.FROM_DATE')) },
      { field: 'rate', minWidth: 110, header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX_FORM.SENTENCE')) }
    ];
  }

  onSubmit(): void {
    if (this.editSalesTaxForm.invalid || !this.vatToEdit) return

    this.isLoading = true;
    const editedVat: Vat = {
      ...this.vatToEdit,
      label: this.editSalesTaxForm.value.label
    }

    this.vatUtils.updateVat(editedVat).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error: Error) => {
        this.isLoading = false;
        if(error.message === 'Version conflict: Vat has been updated by another user'){
          this.showOCCErrorModalVat = true;
        }else{
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  private setupVatSubscription(): void {
    this.subscriptions.add(
      this.vatStateService.currentVat$.subscribe(vat => {
        if(vat){
          this.vatToEdit = vat;
          this.editSalesTaxForm.patchValue({
            label: this.vatToEdit.label,
          });
        }
      })
    )
  }

  public onRefresh(): void {
    if (this.vatToEdit?.id) {
      localStorage.setItem('selectedVatId', this.vatToEdit.id.toString());
      window.location.reload();
    }
  }

  public clearForm(): void {
    this.editSalesTaxForm.reset();
    this.vatStateService.clearVat();
    this.vatToEdit = null;
  }

  private loadVatAfterRefresh(vatId: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.vatUtils.getVatById(Number(vatId)).subscribe({
        next: (vat) => {
          if (vat) {
            this.vatStateService.setVatToEdit(vat);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      })
    );
  }
}