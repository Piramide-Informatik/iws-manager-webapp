import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { FundingProgram } from '../../../../../../Entities/fundingProgram';
import { FundingProgramUtils } from '../../utils/funding-program-utils';

@Component({
  selector: 'app-modal-funding-program',
  standalone: false,
  templateUrl: './modal-funding-program.component.html',
  styleUrl: './modal-funding-program.component.scss'
})
export class ModalFundingProgramComponent {
  private readonly fundingProgramUtils = inject(FundingProgramUtils);
  @Input() selectedFunding!: FundingProgram | undefined;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() onCreateFundingProgram = new EventEmitter<{created?: FundingProgram, status: 'success' | 'error'}>();
  @Output() onDeleteFundingProgram = new EventEmitter<{status: 'success' | 'error'}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;

  public readonly fundingProgramForm = new FormGroup({
    name: new FormControl(''),
    defaultFundingRate: new FormControl(null),
    defaultStuffFlat: new FormControl(null),
    defaultResearchShare: new FormControl(null),
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
    if (this.selectedFunding) {
      this.fundingProgramUtils.deleteFundingProgram(this.selectedFunding.id).subscribe({
        next: () => {
          this.onDeleteFundingProgram.emit({status: 'success'});
        },
        error: () => {
          this.onDeleteFundingProgram.emit({status: 'error'});
        },
        complete: () => {
          this.isLoading = false;
          this.closeModal();
          this.selectedFunding = undefined;
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
