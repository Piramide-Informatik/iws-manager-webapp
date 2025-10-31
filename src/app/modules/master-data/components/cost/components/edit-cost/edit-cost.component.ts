import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CostTypeUtils } from '../../utils/cost-type-utils';
import { CostTypeStateService } from '../../utils/cost-type-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription, take } from 'rxjs';
import { CostType } from '../../../../../../Entities/costType';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

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
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly subscriptions = new Subscription();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  private costTypeToEdit: CostType | null = null;
  public showOCCErrorModaCost = false;
  public isLoading: boolean = false;
  public costForm!: FormGroup;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public typeAlreadyExist = false;

  constructor(private readonly fb: FormBuilder) { }

  ngOnInit(): void {
    this.costForm = this.fb.group({
      type: ['', [Validators.required]],
      sequenceNo: [null],
    });
    this.setupCostTypeSubscription();
    
    // Reset typeAlreadyExist when user types
    this.costForm.get('type')?.valueChanges.subscribe(() => {
      if (this.typeAlreadyExist) {
        this.typeAlreadyExist = false;
      }
    });
    
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
    if (this.costForm.invalid || !this.costTypeToEdit) return;

    this.isLoading = true;
    const updatedCost: CostType = {
      ...this.costTypeToEdit,
      type: this.costForm.value.type?.trim(),
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
        this.handleUpdateError(error);
      }
    });
  }

  private handleUpdateError(error: any): void {
    if (error instanceof OccError) {
      console.log('OCC Error occurred:', error);
      this.showOCCErrorModaCost = true;
      this.occErrorType = error.errorType;
    } else if (error?.message?.includes('cost type already exists')) {
      this.typeAlreadyExist = true;
      this.costForm.get('type')?.valueChanges.pipe(take(1))
        .subscribe(() => this.typeAlreadyExist = false);
      
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('COSTS.ERROR.TYPE_ALREADY_EXIST'),
      });
    } else if (error?.message?.includes('Cost type is required')) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('ERROR.FIELD_REQUIRED'),
      });
    } else {
      this.commonMessageService.showErrorEditMessage();
    }
  }

  private setupCostTypeSubscription(): void {
    this.subscriptions.add(
      this.costTypeStateService.currentCostType$.subscribe(cost => {
        this.costTypeToEdit = cost;
        if (cost) {
          this.loadCostType(cost);
        } else {
          this.costForm.reset();
          this.costTypeToEdit = null;
        }
      })
    )
  }

  private loadCostType(cost: CostType): void {
    this.costForm.patchValue({
      type: cost.type,
      sequenceNo: cost.sequenceNo
    });
    this.focusInputIfNeeded();
  }

  clearForm(): void {
    this.costForm.reset();
    this.costTypeStateService.clearCostType();
    this.costTypeToEdit = null;
    this.typeAlreadyExist = false;
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
      globalThis.location.reload();
    }
  }

  private focusInputIfNeeded(): void {
    if (this.costTypeToEdit && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}