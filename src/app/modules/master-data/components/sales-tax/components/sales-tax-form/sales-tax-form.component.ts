import { Component, computed, ElementRef, EventEmitter, inject, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import { Subscription, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TranslateService, _ } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { Vat } from '../../../../../../Entities/vat';
import { VatUtils } from '../../utils/vat-utils';
import { VatStateService } from '../../utils/vat-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Column } from '../../../../../../Entities/column';
import { VatRateService } from '../../../../../../Services/vat-rate.service';
import { VatRateUtils } from '../../utils/vat-rate-utils';
import { VatRate } from '../../../../../../Entities/vatRate';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { ModalSalesTaxRateComponent } from './modal-sales-tax-rate/modal-sales-tax-rate.component';

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
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  @ViewChild('vatRateModal') vatRateModal!: ModalSalesTaxRateComponent;
  @Output() vatEdited = new EventEmitter<void>();
  @Output() vatRateEdited = new EventEmitter<void>();
  public vatToEdit: Vat | null = null;
  public showOCCErrorModalVat = false;
  public isLoading: boolean = false;
  public editSalesTaxForm!: FormGroup;

  // Configure table VatRate (SalesTaxRate)
  private readonly vatRateService = inject(VatRateService);
  private readonly vatRateUtils = inject(VatRateUtils);
  salesTaxRatesColumns: Column[] = [];
  userSalesTaxFormPreferences: UserPreference = {};
  tableKey: string = 'SalesTaxForm'
  dataKeys = ['fromdate', 'rate'];
  modalType: 'create' | 'delete' | 'edit' = 'create';
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  visibleModal: boolean = false;
  buttonsDisabledTableVatRate: boolean = true;
  selectedVatRate!: VatRate | undefined;

  public readonly vatRates = computed(() => {
    return this.vatRateService.vatRates();
  })

  private langSalesTaxRateSubscription!: Subscription;

  ngOnInit(): void {
    this.editSalesTaxForm = new FormGroup({
      label: new FormControl('')
    });
    this.setupVatSubscription();
    
    this.editSalesTaxForm.get('label')?.setAsyncValidators(this.checkDuplicateLabel());
    
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
  }

  private checkDuplicateLabel(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.trim() === '') {
        return of(null);
      }
      
      const currentVatId = this.vatToEdit?.id;
      return this.vatUtils.checkVatLabelExists(control.value, currentVatId).pipe(
        map(exists => exists ? { labelExists: true } : null),
        catchError(() => of(null))
      );
    };
  }

  onUserSalesTaxFormPreferencesChanges(userSalesTaxFormPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userSalesTaxFormPreferences));
  }

  ngOnDestroy(): void {
    if (this.langSalesTaxRateSubscription) {
      this.langSalesTaxRateSubscription.unsubscribe();
    }
    this.subscriptions.unsubscribe();
  }

  loadSalesTaxRateHeadersAndColumns() {
    this.salesTaxRatesColumns = [
      { field: 'fromdate', minWidth: 110, type: 'date', header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX_FORM.FROM_DATE')) },
      { field: 'rate', type: 'double', customClasses: ['align-right'], minWidth: 110, header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX_FORM.SENTENCE')) }
    ];
  }

  onSubmit(): void {
    if (this.editSalesTaxForm.invalid || !this.vatToEdit) return

    this.isLoading = true;
    const editedVat: Vat = {
      ...this.vatToEdit,
      label: this.editSalesTaxForm.value.label?.trim()
    }

    this.vatUtils.updateVat(editedVat).subscribe({
      next: () => {
        this.vatEdited.emit();
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.handleOCCUpdateError(error);
        if (error.message === 'Version conflict: Vat has been updated by another user') {
          this.showOCCErrorModalVat = true;
        } else {
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  private handleOCCUpdateError(error: Error) {
    if (error instanceof OccError) {
      this.showOCCErrorModalVat = true;
      this.occErrorType = error.errorType;
    }
  }

  private setupVatSubscription(): void {
    this.subscriptions.add(
      this.vatStateService.currentVat$.subscribe(vat => {
        if (vat) {
          this.vatToEdit = vat;
          this.editSalesTaxForm.patchValue({
            label: this.vatToEdit.label,
          });
          this.focusInputIfNeeded();
          // Load VatRates (SalesTaxRates) for the selected Vat (SalesTax)
          this.vatRateUtils.getAllVatRatesByVatId(this.vatToEdit.id).subscribe();
          this.buttonsDisabledTableVatRate = false;
        } else {
          this.editSalesTaxForm.reset();
          this.vatRateService.clearVatRates();
        }
      })
    )
  }

  public onRefresh(): void {
    if (this.vatToEdit?.id) {
      localStorage.setItem('selectedVatId', this.vatToEdit.id.toString());
      globalThis.location.reload();
    }
  }

  public clearForm(): void {
    this.editSalesTaxForm.reset();
    this.vatStateService.clearVat();
    this.vatToEdit = null;
    this.vatRateService.clearVatRates();
    this.buttonsDisabledTableVatRate = true;
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

  public handleTableEvents(event: { type: 'create' | 'delete' | 'edit', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedVatRate = this.vatRateService.vatRates().find(vr => vr.id == event.data);
    }

    if (event.type === 'edit' && event.data) {
      this.selectedVatRate = event.data;
    }

    this.visibleModal = true;
  }

  onCreateVatRate(event: { created?: VatRate, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      const sub = this.vatRateService.loadInitialData().subscribe();
      this.subscriptions.add(sub);
      this.prepareTableData();
      this.commonMessageService.showCreatedSuccesfullMessage();
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  private prepareTableData() {
    if (this.vatRates().length > 0) {
      this.salesTaxRatesColumns = [
        { field: 'name', header: 'Sales Tax Rate' }
      ];
    }
  }

  onCloseModal(): void {
    this.vatRateModal.closeModal();
  }

  onDeleteVatRate(deleteEvent: {status: 'success' | 'error', error?: Error}): void {
    if(deleteEvent.status === 'success'){
      this.commonMessageService.showDeleteSucessfullMessage();
    } else if (deleteEvent.status === 'error' && deleteEvent.error) {
      if (deleteEvent.error.message === 'Cannot delete register: it is in use by other entities') {
        this.commonMessageService.showErrorDeleteMessageUsedByOtherEntities();
      } else {
        this.commonMessageService.showErrorDeleteMessage();
      }
    }
  }

  onEditVatRate(event: { status: 'success' | 'error', error?: Error }): void {
    if (event.status === 'success') {
      this.commonMessageService.showEditSucessfullMessage();
    } else if (event.status === 'error' && event.error) {
      if (event.error.message === 'Version conflict: VatRate has been updated by another user') {
        this.visibleModal = false;
        this.showOCCErrorModalVat = true;
      } else {
        this.commonMessageService.showErrorEditMessage();
      }
    }
  }

  private focusInputIfNeeded(): void {
    if (this.vatToEdit && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}