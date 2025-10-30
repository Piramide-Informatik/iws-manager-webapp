import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { VatUtils } from '../../utils/vat-utils';
import { Vat } from '../../../../../../Entities/vat';
import { FormControl, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { Subscription, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-sales-tax-modal',
  standalone: false,
  templateUrl: './sales-tax-modal.component.html',
  styleUrl: './sales-tax-modal.component.scss'
})
export class SalesTaxModalComponent implements OnChanges, OnInit {
  private readonly vatUtils = inject(VatUtils);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedVat!: Vat;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createVat = new EventEmitter<{ created?: Vat, status: 'success' | 'error' }>();
  @Output() deleteVat = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public isLoading: boolean = false;
  private readonly subscriptions = new Subscription();
  public showOCCErrorModalVat = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  public readonly vatForm = new FormGroup({
    label: new FormControl('')
  });

  ngOnInit(): void {
    this.vatForm.get('label')?.setAsyncValidators(this.checkDuplicateLabel.bind(this));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.modalType === 'create') {
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }
  private checkDuplicateLabel(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!control.value || control.value.trim() === '') {
      return of(null);
    }
    
    return this.vatUtils.checkVatLabelExists(control.value).pipe(
      map(exists => exists ? { labelExists: true } : null),
      catchError(() => of(null))
    );
  }

  onSubmit(): void {
    if (this.vatForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newVat: Omit<Vat, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      label: this.vatForm.value.label?.trim()
    }

    this.vatUtils.addVat(newVat).subscribe({
      next: (created) => {
        this.createVat.emit({ created, status: 'success' });
        this.isLoading = false;
        this.closeModal();
      },
      error: () => {
        this.createVat.emit({ status: 'error' });
        this.isLoading = false;
      }
    })
  }

  deleteSelectedVat() {
    this.isLoading = true;
    if (this.selectedVat) {
      this.vatUtils.deleteVat(this.selectedVat.id).subscribe({
        next: () => {
          this.deleteVat.emit({ status: 'success' });
          this.isLoading = false;
          this.closeModal();
        },
        error: (error) => {
          this.handleOccDeleteError(error);
          if (error.error.message.includes('a foreign key constraint fails')) {
            this.closeModal();
          }
          this.deleteVat.emit({ status: 'error', error: error });
          this.isLoading = false;
        }
      })
    }
  }

  private handleOccDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalVat = true;
      this.occErrorType = 'DELETE_UNEXISTED';
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