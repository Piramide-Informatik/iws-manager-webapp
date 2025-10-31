import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CostTypeUtils } from '../../utils/cost-type-utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CostType } from '../../../../../../Entities/costType';
import { CostTypeStateService } from '../../utils/cost-type-state.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-cost',
  standalone: false,
  templateUrl: './modal-cost.component.html',
  styleUrl: './modal-cost.component.scss'
})
export class ModalCostComponent implements OnChanges, OnInit {
  private readonly costTypeUtils = inject(CostTypeUtils);
  private readonly costTypeStateService = inject(CostTypeStateService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  @Input() selectedCostType!: CostType | undefined;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visible: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() onCreateCostType = new EventEmitter<{ created?: CostType, status: 'success' | 'error' }>();
  @Output() onDeleteCostType = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalCost = false;
  public typeAlreadyExist = false;

  public readonly costTypeForm = new FormGroup({
    type: new FormControl('', [Validators.required]),
    sequenceNo: new FormControl(null)
  });

  ngOnInit(): void {
    // Reset typeAlreadyExist when user types
    this.costTypeForm.get('type')?.valueChanges.subscribe(() => {
      if (this.typeAlreadyExist) {
        this.typeAlreadyExist = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  onSubmit(): void {
    if (this.costTypeForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newCostType: Omit<CostType, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      type: this.costTypeForm.value.type?.trim(),
      sequenceNo: this.costTypeForm.value.sequenceNo ?? 0
    }

    this.costTypeUtils.addCostType(newCostType).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.onCreateCostType.emit({ created, status: 'success' });
      },
      error: (error) => {
        this.isLoading = false;
        this.handleCreateError(error);
      }
    })
  }

  private handleCreateError(error: any): void {
    if (error?.message?.includes('cost type already exists')) {
      this.typeAlreadyExist = true;
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('COSTS.ERROR.TYPE_ALREADY_EXIST'),
      });
      this.onCreateCostType.emit({ status: 'error' });
    } else if (error?.message?.includes('Cost type is required')) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('ERROR.FIELD_REQUIRED'),
      });
      this.onCreateCostType.emit({ status: 'error' });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('MESSAGE.CREATE_FAILED'),
      });
      this.onCreateCostType.emit({ status: 'error' });
    }
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.costTypeForm.reset();
    this.typeAlreadyExist = false;
  }

  onDeleteCostTypeConfirm(): void {
    this.isLoading = true;
    if (this.selectedCostType) {
      this.costTypeUtils.deleteCostType(this.selectedCostType.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.costTypeStateService.clearCostType();
          this.onDeleteCostType.emit({ status: 'success' });
          this.closeModal();
        },
        error: (errorResponse) => {
          this.isLoading = false;
          this.handleDeleteError(errorResponse);
          this.onDeleteCostType.emit({ status: 'error', error: errorResponse });
        }
      });
    }
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalCost = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
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