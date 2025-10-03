import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { VatUtils } from '../../utils/vat-utils';
import { Vat } from '../../../../../../Entities/vat';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-sales-tax-modal',
  standalone: false,
  templateUrl: './sales-tax-modal.component.html',
  styleUrl: './sales-tax-modal.component.scss'
})
export class SalesTaxModalComponent implements OnChanges {
  private readonly vatUtils = inject(VatUtils);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedVat!: Vat;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createVat = new EventEmitter<{created?: Vat, status: 'success' | 'error'}>();
  @Output() deleteVat = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public isLoading: boolean = false;

  public readonly vatForm = new FormGroup({
    label: new FormControl('')
  });

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.modalType === 'create'){
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  onSubmit(): void {
    if(this.vatForm.invalid || this.isLoading) return 
    
    this.isLoading = true;
    const newVat: Omit<Vat, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      label: this.vatForm.value.label?.trim()
    }

    this.vatUtils.addVat(newVat).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createVat.emit({created, status: 'success'});
      },
      error: () => {
        this.isLoading = false;
        this.createVat.emit({ status: 'error' });
      } 
    })
  }

  deleteSelectedVat() {
    this.isLoading = true;
    if (this.selectedVat) {
      this.vatUtils.deleteVat(this.selectedVat.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteVat.emit({status: 'success'});
        },
        error: (error) => {
          this.isLoading = false;
          this.deleteVat.emit({ status: 'error', error: error });
        }
      })
    }
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.vatForm.reset();
  }

  private focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
