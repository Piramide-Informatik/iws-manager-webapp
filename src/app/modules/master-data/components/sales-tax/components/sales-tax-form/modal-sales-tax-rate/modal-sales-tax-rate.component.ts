import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { VatRateUtils } from '../../../utils/vat-rate-utils';
import { VatRate } from '../../../../../../../Entities/vatRate';
import { DatePicker } from 'primeng/datepicker';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VatStateService } from '../../../utils/vat-state.service';
import { Vat } from '../../../../../../../Entities/vat';
import { momentCreateDate, momentFormatDate } from '../../../../../../shared/utils/moment-date-utils';
import { OccError, OccErrorType } from '../../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-modal-sales-tax-rate',
  standalone: false,
  templateUrl: './modal-sales-tax-rate.component.html',
  styleUrl: './modal-sales-tax-rate.component.scss'
})
export class ModalSalesTaxRateComponent implements OnInit, OnChanges {
  private readonly vatRateUtils = inject(VatRateUtils);
  private readonly vatStateService = inject(VatStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  @Input() selectedVatRate!: VatRate | undefined;
  @Input() modalType: 'create' | 'delete' | 'edit' = 'create';
  @Input() visibleModal: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createVatRate = new EventEmitter<{ status: 'success' | 'error' }>();
  @Output() deleteVatRate = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @Output() editVatRate = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @Output() updatedVatRate = new EventEmitter<void>();
  @ViewChild('firstInput') firstInput!: DatePicker;
  private currentVat!: Vat | null;
  public isLoading: boolean = false;
  public isLoadingDelete: boolean = false;
  public visibleModalDeleteConfirmVatRate: boolean = false;
  public vatRateForm!: FormGroup;
  public showOCCErrorModalTaxRate = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  ngOnInit(): void {
    this.initForm();
    this.vatStateService.currentVat$.subscribe(vat => {
      if (vat) {
        this.currentVat = vat;
      }
    });
  }

  private initForm(): void {
    this.vatRateForm = new FormGroup({
      fromdate: new FormControl(),
      rate: new FormControl(null, [Validators.max(100.00)])
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visibleModal'] && this.visibleModal) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
    if ((changes['selectedVatRate'] || changes['visibleModal']) && this.visibleModal && this.selectedVatRate && this.modalType === 'edit') {
      this.vatRateForm.patchValue({
        fromdate: momentCreateDate(this.selectedVatRate.fromdate),
        rate: this.selectedVatRate.rate
      });
    }
  }

  onSubmit(): void {
    if (this.vatRateForm.invalid || this.isLoading || !this.currentVat) return

    this.isLoading = true;
    if (this.modalType === 'create') {
      this.createNewVatRate();
    } else if (this.modalType === 'edit') {
      this.updateVatRate();
    }
  }

  private createNewVatRate(): void {
    const newVatRate: Omit<VatRate, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      fromdate: momentFormatDate(this.vatRateForm.value.fromdate),
      rate: this.vatRateForm.value.rate ?? 0,
      vat: this.currentVat
    }

    this.vatRateUtils.addVatRate(newVatRate).subscribe({
      next: () => {
        this.isLoading = false;
        this.vatRateUtils.getAllVatRatesByVatId(this.currentVat!.id).subscribe();
        this.updatedVatRate.emit();
        this.closeModal();
        this.createVatRate.emit({ status: 'success' });
        this.commonMessageService.showCreatedSuccesfullMessage();
      },
      error: () => {
        this.isLoading = false;
        this.createVatRate.emit({ status: 'error' })
        this.commonMessageService.showErrorCreatedMessage();
      }
    });
  }

  private updateVatRate(): void {
    if (!this.selectedVatRate) return

    const editedVatRate: VatRate = {
      ...this.selectedVatRate,
      fromdate: momentFormatDate(this.vatRateForm.value.fromdate),
      rate: this.vatRateForm.value.rate ?? 0,
      vat: this.selectedVatRate.vat
    };

    this.vatRateUtils.updateVatRate(editedVatRate).subscribe({
      next: () => {
        this.isLoading = false;
        this.vatRateUtils.getAllVatRatesByVatId(this.currentVat!.id).subscribe();
        this.updatedVatRate.emit();
        this.closeModal();
        this.editVatRate.emit({ status: 'success' });
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.handleOccError(error);
        this.editVatRate.emit({ status: 'error', error });
      }
    });
  }

  handleOccError(error: Error) {
    if (error instanceof OccError) {
      this.showOCCErrorModalTaxRate = true;
      this.occErrorType = error.errorType;
    }
  }

  public onDeleteConfirm(): void {
    this.isLoadingDelete = true;
    if (this.selectedVatRate) {
      this.vatRateUtils.deleteVatRate(this.selectedVatRate.id).subscribe({
        next: () => {
          this.isLoadingDelete = false;
          this.deleteVatRate.emit({ status: 'success' });
          this.vatRateUtils.getAllVatRatesByVatId(this.currentVat!.id).subscribe();
          this.closeModal();
          this.visibleModalDeleteConfirmVatRate = false;
          this.selectedVatRate = undefined;
        },
        error: (error: Error) => {
          this.isLoadingDelete = false;
          this.handleDeleteOccError(error);
          this.deleteVatRate.emit({ status: 'error', error });
        }
      })
    }
  }
  handleDeleteOccError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalTaxRate = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.vatRateForm.reset();
  }

  private focusInputIfNeeded(): void {
    if (this.modalType !== 'delete' && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.inputfieldViewChild) {
          this.firstInput.inputfieldViewChild.nativeElement.focus();
        }
      }, 200);
    }
  }
}
