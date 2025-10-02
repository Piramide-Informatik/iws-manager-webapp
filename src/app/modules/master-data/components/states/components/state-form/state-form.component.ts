import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StatesStateService } from '../../utils/states.state.service.service';
import { State } from '../../../../../../Entities/state';
import { emptyValidator } from '../../../types-of-companies/utils/empty.validator';
import { StateUtils } from '../../utils/state-utils';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-state-form',
  standalone: false,
  templateUrl: './state-form.component.html',
  styleUrl: './state-form.component.scss'
})
export class StateFormComponent implements OnInit, OnDestroy {
  public showOCCErrorModaState = false;
  state: State | null = null;
  editStateForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly stateServiceUtils: StateUtils,
    private readonly statesStateService: StatesStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.setupStateSubscription();
    // Check if we need to load a state after page refresh
    const savedStateId = localStorage.getItem('selectedStateId');
    if (savedStateId) {
      this.loadStateAfterRefresh(savedStateId);
      localStorage.removeItem('selectedStateId');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.editStateForm = new FormGroup({
      name: new FormControl('', [Validators.required, emptyValidator()])
    });
  }

  private setupStateSubscription(): void {
    this.subscriptions.add(
      this.statesStateService.currentState$.subscribe((state) => {
        if (state === null) {
          this.clearForm();
        } else {
          this.state = state;
          this.editStateForm.patchValue(state);
          this.editStateForm.updateValueAndValidity();
        }
      })
    );
  }

  private loadStateAfterRefresh(stateId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.stateServiceUtils.getStateById(Number(stateId)).subscribe({
        next: (state) => {
          if (state) {
            this.statesStateService.setStateToEdit(state);
          }
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      })
    );
  }

  onRefresh(): void {
    if (this.state?.id) {
      localStorage.setItem('selectedStateId', this.state.id.toString());
      window.location.reload();
    }
  }

  clearForm(): void {
    this.editStateForm.reset();
    this.state = null;
    this.isSaving = false;
  }

  onStateEditFormSubmit(): void {
    if (this.editStateForm.invalid || !this.state || this.isSaving) {
      this.markAllFieldsAsTouched();
      return;
    }
    this.isSaving = true;
    const state = Object.assign(this.state, this.editStateForm.value);
    this.subscriptions.add(
      this.stateServiceUtils.updateState(state).subscribe({
        next: (savedState) => this.handleSaveStateSuccess(savedState),
        error: (err) => this.handleSaveStateError(err)
      })
    );
  }

  private handleSaveStateSuccess(state: State): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('MESSAGE.SUCCESS'),
      detail: this.translate.instant('STATES.MESSAGE.UPDATE_SUCCESS')
    });
    this.statesStateService.setStateToEdit(null);
    this.clearForm();
  }

  private handleSaveStateError(error: any): void {
    console.error('Error saving state:', error);
    if (error instanceof Error && 
        (error.message?.includes('version mismatch') || 
         error.message === 'Version conflict: State has been updated by another user')) {
      this.showOCCErrorModaState = true;
      this.isSaving = false;
      return;
    }
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('MESSAGE.ERROR'),
      detail: this.translate.instant('STATES.ERROR.UPDATE_FAILED')
    });
    this.isSaving = false;
  }

  private markAllFieldsAsTouched(): void {
    Object.values(this.editStateForm.controls).forEach(controlStateForm => {
      controlStateForm.markAsTouched();
      controlStateForm.markAsDirty();
    });
  }
}
