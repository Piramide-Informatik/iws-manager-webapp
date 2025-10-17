import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Salutation } from '../../../../../../Entities/salutation';
import { SalutationUtils } from '../../utils/salutation.utils';
import { SalutationStateService } from '../../utils/salutation-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
@Component({
  selector: 'app-salutation-form',
  templateUrl: './salutation-form.component.html',
  styleUrls: ['./salutation-form.component.scss'],
  standalone: false,
})
export class SalutationFormComponent implements OnInit, OnDestroy {
  currentSalutation: Salutation | null = null;
  editSalutationForm!: FormGroup;
  isSaving = false;
  public isLoading: boolean = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalSalutation = false;
  private readonly subscriptions = new Subscription();
  private readonly editSalutationSource = new BehaviorSubject<Salutation | null>(null);
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly salutationUtils: SalutationUtils,
    private readonly salutationStateService: SalutationStateService,
    private readonly commonMessageService: CommonMessagesService,
    private readonly translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.setupSalutationSubscription();
    // Check if we need to load a salutation after page refresh
    const savedSalutationId = localStorage.getItem('selectedSalutationId');
    if (savedSalutationId) {
      this.loadSalutationAfterRefresh(savedSalutationId);
      localStorage.removeItem('selectedSalutationId');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setSalutationToEdit(salutation: Salutation | null) {
    this.editSalutationSource.next(salutation);
  }

  private initForm(): void {
    this.editSalutationForm = new FormGroup({
      salutation: new FormControl('')
    });
  }

  private setupSalutationSubscription(): void {
    this.subscriptions.add(
      this.salutationStateService.currentSalutation$.subscribe(salutation => {
        this.currentSalutation = salutation;
        salutation ? this.loadSalutationData(salutation) : this.clearForm();
      })
    );
  }

  private loadSalutationData(salutation: Salutation): void {
    this.editSalutationForm.patchValue({ salutation: salutation.name });
    this.focusInputIfNeeded();
  }

  private loadSalutationAfterRefresh(salutationId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.salutationUtils.getSalutationById(Number(salutationId)).subscribe({
        next: (salutation) => {
          if (salutation) {
            this.salutationStateService.setSalutationToEdit(salutation);
          }
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      })
    );
  }

  clearForm(): void {
    this.editSalutationForm.reset();
    this.currentSalutation = null;
    this.isSaving = false;
  }

  onSubmit(): void {
    if (this.editSalutationForm.invalid || !this.currentSalutation || this.isSaving) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updatedSalutation: Salutation = {
      ...this.currentSalutation,
      name: this.editSalutationForm.value.salutation?.trim()
    };

    
      this.salutationUtils.updateSalutation(updatedSalutation).subscribe({
        next: () => {
          this.isLoading = false;
          this.clearForm();
          this.commonMessageService.showEditSucessfullMessage();
        },
        error: (error: Error) => {
          this.isLoading = false;
          if (error instanceof OccError) {
            this.showOCCErrorModalSalutation = true;
            this.occErrorType = error.errorType;
          } else {
            this.commonMessageService.showErrorEditMessage();
          }
          }
      })
  }

  private markAllAsTouched(): void {
    Object.values(this.editSalutationForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  onRefresh(): void {
    if (this.currentSalutation?.id) {
      localStorage.setItem('selectedSalutationId', this.currentSalutation.id.toString());
      window.location.reload();
    }
  }

  private focusInputIfNeeded(): void {
    if (this.currentSalutation && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}