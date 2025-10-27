import { Component, ElementRef, EventEmitter, inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FundingProgram } from '../../../../../../Entities/fundingProgram';
import { FundingProgramUtils } from '../../utils/funding-program-utils';
import { FundingProgramStateService } from '../../utils/funding-program-state.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-funding-program',
  standalone: false,
  templateUrl: './modal-funding-program.component.html',
  styleUrl: './modal-funding-program.component.scss'
})
export class ModalFundingProgramComponent implements OnInit, OnDestroy {
  private readonly fundingProgramUtils = inject(FundingProgramUtils);
  private readonly fundingProgramStateService = inject(FundingProgramStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  
  @Input() selectedFunding!: FundingProgram | undefined;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() onCreateFundingProgram = new EventEmitter<{ created?: FundingProgram, status: 'success' | 'error' }>();
  @Output() onDeleteFundingProgram = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;
  public showOCCErrorModaFunding = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public nameAlreadyExist = false;

  public readonly fundingProgramForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    defaultFundingRate: new FormControl(null, [Validators.max(100)]),
    defaultStuffFlat: new FormControl(null, [Validators.max(100)]),
    defaultResearchShare: new FormControl(null, [Validators.max(100)]),
    defaultHoursPerYear: new FormControl(null)
  })

  ngOnInit(): void {
    this.fundingProgramForm.get('name')?.valueChanges.subscribe(() => {
      if (this.nameAlreadyExist) {
        this.nameAlreadyExist = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public onSubmit(): void {
    if (this.fundingProgramForm.invalid || this.isLoading || this.nameAlreadyExist) return

    this.isLoading = true;
    const newFundingProgram: Omit<FundingProgram, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.fundingProgramForm.value.name?.trim() || '',
      defaultFundingRate: this.fundingProgramForm.value.defaultFundingRate ?? 0,
      defaultStuffFlat: this.fundingProgramForm.value.defaultStuffFlat ?? 0,
      defaultResearchShare: this.fundingProgramForm.value.defaultResearchShare ?? 0,
      defaultHoursPerYear: this.fundingProgramForm.value.defaultHoursPerYear ?? 0
    };

    const nameToCheck = newFundingProgram.name || '';
    this.fundingProgramUtils.checkFundingProgramNameExists(nameToCheck).subscribe({
      next: (exists: boolean) => {
        if (exists) {
          this.nameAlreadyExist = true;
          this.isLoading = false;
          this.commonMessageService.showErrorCreatedMessage();
        } else {
          this.performCreate(newFundingProgram);
        }
      },
      error: () => {
        this.isLoading = false;
        this.commonMessageService.showErrorCreatedMessage(); 
        this.onCreateFundingProgram.emit({ status: 'error' })
      }
    });
  }

  private performCreate(newFundingProgram: Omit<FundingProgram, 'id' | 'createdAt' | 'updatedAt' | 'version'>): void {
    this.fundingProgramUtils.addFundingProgram(newFundingProgram).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.onCreateFundingProgram.emit({ created, status: 'success' })
      },
      error: (error) => {
        this.isLoading = false;
        if (error?.message?.includes('name already exists')) {
          this.nameAlreadyExist = true;
          this.commonMessageService.showErrorCreatedMessage(); 
        } else {
          this.commonMessageService.showErrorCreatedMessage();
        }
        this.onCreateFundingProgram.emit({ status: 'error' })
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
          this.onDeleteFundingProgram.emit({ status: 'success' });
          this.closeModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.handleDeleteError(error);
          if (error.error?.message?.includes('a foreign key constraint fails')) {
            this.closeModal();
          }
          this.onDeleteFundingProgram.emit({ status: 'error', error });
        }
      })
    }
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModaFunding = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.fundingProgramForm.reset();
    this.nameAlreadyExist = false;
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