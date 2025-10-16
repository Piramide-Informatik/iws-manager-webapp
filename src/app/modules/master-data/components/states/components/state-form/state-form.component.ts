import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StatesStateService } from '../../utils/states.state.service.service';
import { State } from '../../../../../../Entities/state';
import { emptyValidator } from '../../../types-of-companies/utils/empty.validator';
import { StateUtils } from '../../utils/state-utils';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

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
  public occErrorStateType: OccErrorType = 'UPDATE_UPDATED';
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly stateServiceUtils: StateUtils,
    private readonly statesStateService: StatesStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
    private readonly commonMessageService: CommonMessagesService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.setupStateSubscription();
    // Check if we need to load a state after page refresh
    this.loadStateAfterRefresh();
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
          this.editStateForm.reset();
        } else {
          this.state = state;
          this.editStateForm.patchValue(state);
          this.focusInputIfNeeded();
          this.editStateForm.updateValueAndValidity();
        }
      })
    );
  }

  // MODIFICADO: Mejorar el manejo de localStorage
  private loadStateAfterRefresh(): void {
    const savedStateId = localStorage.getItem('selectedStateId');
    if (savedStateId) {
      this.isSaving = true;
      this.subscriptions.add(
        this.stateServiceUtils.getStateById(Number(savedStateId)).subscribe({
          next: (state) => {
            if (state) {
              this.statesStateService.setStateToEdit(state);
            }
            this.isSaving = false;
            localStorage.removeItem('selectedStateId');
          },
          error: () => {
            this.isSaving = false;
            localStorage.removeItem('selectedStateId');
          }
        })
      );
    }
  }

  // MODIFICADO: Usar globalThis.location.reload() para consistencia
  public onRefresh(): void {
    if (this.state?.id) {
      localStorage.setItem('selectedStateId', this.state.id.toString());
      globalThis.location.reload();
    }
  }

  clearForm(): void {
    this.editStateForm.reset();
    this.state = null;
    this.isSaving = false;
    this.statesStateService.setStateToEdit(null);
  }

  onStateEditFormSubmit(): void {
    if (this.editStateForm.invalid || !this.state || this.isSaving) {
      this.markAllFieldsAsTouched();
      return;
    }
    this.isSaving = true;
    const stateFormValue = this.editStateForm.value;
    stateFormValue.name = stateFormValue.name?.trim();
    const state = Object.assign(this.state, stateFormValue);
    this.subscriptions.add(
      this.stateServiceUtils.updateState(state).subscribe({
        next: (savedState) => this.handleSaveStateSuccess(savedState),
        error: (err) => this.handleSaveStateError(err)
      })
    );
  }

  private handleSaveStateSuccess(state: State): void {
    this.isSaving = false;
    this.commonMessageService.showEditSucessfullMessage();
    this.statesStateService.setStateToEdit(null);
    this.clearForm();
  }

  // MODIFICADO: Mejorar manejo de errores OCC
  private handleSaveStateError(error: any): void {
    this.isSaving = false;
    if (error instanceof OccError) { 
      this.showOCCErrorModaState = true;
      this.occErrorStateType = error.errorType;
      this.commonMessageService.showErrorEditMessage(); // Toast para error OCC
    } else {
      console.error('Error saving state:', error);
      this.commonMessageService.showErrorEditMessage();
    }
  }

  private markAllFieldsAsTouched(): void {
    Object.values(this.editStateForm.controls).forEach(controlStateForm => {
      controlStateForm.markAsTouched();
      controlStateForm.markAsDirty();
    });
  }

  private focusInputIfNeeded(): void {
    if (this.state && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}