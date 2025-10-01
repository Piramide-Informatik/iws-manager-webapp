import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FundingProgram } from '../../../../../../Entities/fundingProgram';
import { FundingProgramUtils } from '../../utils/funding-program-utils';
import { FundingProgramStateService } from '../../utils/funding-program-state.service';

@Component({
  selector: 'app-modal-funding-program',
  standalone: false,
  templateUrl: './modal-funding-program.component.html',
  styleUrl: './modal-funding-program.component.scss'
})
export class ModalFundingProgramComponent {
  private readonly fundingProgramUtils = inject(FundingProgramUtils);
  private readonly fundingProgramStateService = inject(FundingProgramStateService);
  @Input() selectedFunding!: FundingProgram | undefined;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() onCreateFundingProgram = new EventEmitter<{created?: FundingProgram, status: 'success' | 'error'}>();
  @Output() onDeleteFundingProgram = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;

  public readonly fundingProgramForm = new FormGroup({
    name: new FormControl(''),
    defaultFundingRate: new FormControl(null, [Validators.max(100.00)]),
    defaultStuffFlat: new FormControl(null, [Validators.max(100.00)]),
    defaultResearchShare: new FormControl(null, [Validators.max(100.00)]),
    defaultHoursPerYear: new FormControl(null)
  })

  public onSubmit(): void {
    if(this.fundingProgramForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newFundingProgram: Omit<FundingProgram, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.fundingProgramForm.value.name ?? '',
      defaultFundingRate: this.fundingProgramForm.value.defaultFundingRate ?? 0,
      defaultStuffFlat: this.fundingProgramForm.value.defaultStuffFlat ?? 0,
      defaultResearchShare: this.fundingProgramForm.value.defaultResearchShare ?? 0,
      defaultHoursPerYear: this.fundingProgramForm.value.defaultHoursPerYear ?? 0
    };

    this.fundingProgramUtils.addFundingProgram(newFundingProgram).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.onCreateFundingProgram.emit({created, status: 'success'})
      },
      error: () => {
        this.isLoading = false;
        this.onCreateFundingProgram.emit({status: 'error'})
      }
    })
  }

  public onDeleteConfirm(): void {
    this.isLoading = true;
    if (this.selectedFunding) {
      this.fundingProgramUtils.deleteFundingProgram(this.selectedFunding.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.fundingProgramStateService.clearFundingProgram();
          this.selectedFunding = undefined;
          this.onDeleteFundingProgram.emit({status: 'success'});
          this.closeModal();
        },
        error: (error: Error) => {
          this.isLoading = false;
          this.onDeleteFundingProgram.emit({status: 'error', error});
        }
      })
    }
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.fundingProgramForm.reset();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  public focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 150);
    }
  }
}
