import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CostTypeUtils } from '../../utils/cost-type-utils';
import { FormControl, FormGroup } from '@angular/forms';
import { CostType } from '../../../../../../Entities/costType';

@Component({
  selector: 'app-modal-cost',
  standalone: false,
  templateUrl: './modal-cost.component.html',
  styleUrl: './modal-cost.component.scss'
})
export class ModalCostComponent {
  private readonly costTypeUtils = inject(CostTypeUtils);
  @Input() selectedCostType!: CostType | undefined;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() onCreateCostType = new EventEmitter<{created?: CostType, status: 'success' | 'error'}>();
  @Output() onDeleteCostType = new EventEmitter<{status: 'success' | 'error', error?: Error}>();

  public isLoading: boolean = false;
  public readonly costTypeForm = new FormGroup({
    type: new FormControl(''),
    sequenceNo: new FormControl(null)
  });

  onSubmit(): void {
    if(this.costTypeForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newCostType: Omit<CostType, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      type: this.costTypeForm.value.type ?? '',
      sequenceNo: this.costTypeForm.value.sequenceNo ?? 0
    }

    this.costTypeUtils.addCostType(newCostType).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.onCreateCostType.emit({created, status: 'success'});
      },
      error: () => {
        this.isLoading = false;
        this.onCreateCostType.emit({status: 'error'});
      }
    })
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.costTypeForm.reset();
  }

  onDeleteCostTypeConfirm(): void {
    this.isLoading = true;
    if(this.selectedCostType){
      this.costTypeUtils.deleteCostType(this.selectedCostType.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.onDeleteCostType.emit({status: 'success'});
          this.closeModal();
        },
        error: (errorResponse) => {
          this.isLoading = false;
          this.onDeleteCostType.emit({status: 'error', error: errorResponse});
        }
      });
    }
  }
}
