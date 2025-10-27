import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FundingProgram } from '../../../../../../Entities/fundingProgram';
import { FundingProgramUtils } from '../../utils/funding-program-utils';
import { FundingProgramStateService } from '../../utils/funding-program-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription, take } from 'rxjs';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-edit-funding-program',
  standalone: false,
  templateUrl: './funding-program-form.component.html',
  styleUrls: ['./funding-program-form.component.scss'],
})
export class FundingProgramFormComponent implements OnInit, OnDestroy {
  private readonly fundingUtils = inject(FundingProgramUtils);
  private readonly fundingStateService = inject(FundingProgramStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  private fundingToEdit: FundingProgram | null = null;
  public showOCCErrorModaFunding = false;
  public isLoading: boolean = false;
  public fundingForm: FormGroup;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public nameAlreadyExist = false;

  constructor(private readonly fb: FormBuilder) {
    this.fundingForm = this.fb.group({
      name: ['', [Validators.required]],
      defaultFundingRate: [null, [Validators.max(100.00)]],
      defaultStuffFlat: [null, [Validators.max(100.00)]],
      defaultResearchShare: [null, [Validators.max(100.00)]],
      defaultHoursPerYear: [null],
    });
  }

  ngOnInit(): void {
    this.setupFundingSubscription();
    // Check if we need to load a funding after page refresh for OCC
    const savedFundingId = localStorage.getItem('selectedFundingId');
    if (savedFundingId) {
      this.loadFundingAfterRefresh(savedFundingId);
      localStorage.removeItem('selectedFundingId');
    }

    this.fundingForm.get('name')?.valueChanges.subscribe(() => {
      if (this.nameAlreadyExist) {
        this.nameAlreadyExist = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private setupFundingSubscription(): void {
    this.subscriptions.add(
      this.fundingStateService.currentFundingProgram$.subscribe(funding => {
        this.fundingToEdit = funding;
        funding ? this.loadFundingProgram(funding) : this.fundingForm.reset();
      })
    )
  }

  private loadFundingProgram(funding: FundingProgram): void {
    this.fundingForm.patchValue({
      name: funding.name,
      defaultFundingRate: funding.defaultFundingRate,
      defaultStuffFlat: funding.defaultStuffFlat,
      defaultResearchShare: funding.defaultResearchShare,
      defaultHoursPerYear: funding.defaultHoursPerYear
    });
    this.focusInputIfNeeded();
  }

  public onSubmit(): void {
    if (this.fundingForm.invalid || !this.fundingToEdit || this.nameAlreadyExist) return

    this.isLoading = true;
    const formData: Omit<FundingProgram, 'id' | 'createdAt' | 'updatedAt' | 'version'> = this.fundingForm.value;
    const editedFunding: FundingProgram = {
      ...this.fundingToEdit,
      name: formData.name?.trim() || '',
      defaultFundingRate: formData.defaultFundingRate ?? 0,
      defaultStuffFlat: formData.defaultStuffFlat ?? 0,
      defaultResearchShare: formData.defaultResearchShare ?? 0,
      defaultHoursPerYear: formData.defaultHoursPerYear ?? 0
    }

    const nameToCheck = editedFunding.name || '';
    this.fundingUtils.checkFundingProgramNameExists(nameToCheck, editedFunding.id).subscribe({
      next: (exists: boolean) => {
        if (exists) {
          this.nameAlreadyExist = true;
          this.isLoading = false;
          this.commonMessageService.showErrorEditMessage();
        } else {
          this.performUpdate(editedFunding);
        }
      },
      error: () => {
        this.isLoading = false;
        this.commonMessageService.showErrorEditMessage();
      }
    });
  }

  private performUpdate(editedFunding: FundingProgram): void {
    this.fundingUtils.updateFundingProgram(editedFunding).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage()
      },
      error: (error) => {
        this.isLoading = false;
        if (error instanceof OccError) {
          this.showOCCErrorModaFunding = true;
          this.occErrorType = error.errorType;
        } else if (error?.message?.includes('name already exists')) {
          this.nameAlreadyExist = true;
          this.fundingForm.get('name')?.valueChanges.pipe(take(1))
            .subscribe(() => this.nameAlreadyExist = false);
          this.commonMessageService.showErrorEditMessage();
        } else {
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  public onRefresh(): void {
    if (this.fundingToEdit?.id) {
      localStorage.setItem('selectedFundingId', this.fundingToEdit.id.toString());
      window.location.reload();
    }
  }

  public clearForm(): void {
    this.fundingForm.reset();
    this.fundingToEdit = null;
    this.isLoading = false;
    this.nameAlreadyExist = false;
    this.fundingStateService.setFundingProgramToEdit(null);
  }

  private loadFundingAfterRefresh(fundingId: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.fundingUtils.getFundingProgramById(Number(fundingId)).subscribe({
        next: (funding) => {
          if (funding) {
            this.fundingStateService.setFundingProgramToEdit(funding);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      })
    );
  }

  private focusInputIfNeeded(): void {
    if (this.fundingToEdit && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}