import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CostTypeUtils } from '../../utils/cost-type-utils';
import { CostTypeStateService } from '../../utils/cost-type-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';
import { CostType } from '../../../../../../Entities/costType';

@Component({
  selector: 'app-edit-cost',
  standalone: false,
  templateUrl: './edit-cost.component.html',
  styleUrl: './edit-cost.component.scss',
})
export class EditCostComponent implements OnInit, OnDestroy {
  private readonly costTypeUtils = inject(CostTypeUtils);
  private readonly costTypeStateService = inject(CostTypeStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  private costTypeToEdit: CostType | null = null;
  public showOCCErrorModaCost = false;
  public isLoading: boolean = false;
  public costForm!: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.costForm = this.fb.group({
      type: [''],
      sequenceNo: [null],
    });
    this.setupCostTypeSubscription();
    // Check if we need to load a cost after page refresh for OCC
    const savedCostTypeId = localStorage.getItem('selectedCostTypeId');
    if (savedCostTypeId) {
      this.loadCostTypeAfterRefresh(savedCostTypeId);
      localStorage.removeItem('selectedCostTypeId');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  updateCost(): void {
    if(this.costForm.invalid || !this.costTypeToEdit) return;

    this.isLoading = true;
    const updatedCost: CostType = {
      ...this.costTypeToEdit,
      type: this.costForm.value.type,
      sequenceNo: this.costForm.value.sequenceNo
    };

    this.costTypeUtils.updateCostType(updatedCost).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error: Error) => {
        this.isLoading = false;
        if(error.message === 'Version conflict: Cost Type has been updated by another user'){
          this.showOCCErrorModaCost = true;
        }else{
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  private setupCostTypeSubscription(): void {
    this.subscriptions.add(
      this.costTypeStateService.currentCostType$.subscribe(cost => {
        if(cost){
          this.costTypeToEdit = cost;
          this.costForm.patchValue({
            type: this.costTypeToEdit.type,
            sequenceNo: this.costTypeToEdit.sequenceNo
          });
        }
      })
    )
  }

  clearForm(): void {
    this.costForm.reset();
    this.costTypeStateService.clearCostType();
    this.costTypeToEdit = null;
  }

  private loadCostTypeAfterRefresh(costTypeId: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.costTypeUtils.getCostTypeById(Number(costTypeId)).subscribe({
        next: (costType) => {
          if (costType) {
            this.costTypeStateService.setCostTypeToEdit(costType);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      })
    );
  }

  public onRefresh(): void {
    if (this.costTypeToEdit?.id) {
      localStorage.setItem('selectedCostTypeId', this.costTypeToEdit.id.toString());
      window.location.reload();
    }
  }
}
