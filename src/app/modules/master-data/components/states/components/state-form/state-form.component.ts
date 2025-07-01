import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StatesStateService } from '../../utils/states.state.service.service';
import { State } from '../../../../../../Entities/state';
import { emptyValidator } from '../../../types-of-companies/utils/empty.validator';
import { StateUtils } from '../../utils/state-utils';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-state-form',
  standalone: false,
  templateUrl: './state-form.component.html',
  styleUrl: './state-form.component.scss'
})
export class StateFormComponent implements OnInit{

  public showOCCErrorModaState = false;
  state: State| null = null;
  editStateForm!: FormGroup;
  isSaving = false;

  constructor(private readonly stateServiceUtils: StateUtils,
              private readonly statesStateService: StatesStateService,
              private readonly messageService: MessageService,
              private readonly translate: TranslateService
  ){ }

  ngOnInit(): void {
    this.editStateForm = new FormGroup({
      name: new FormControl('', [Validators.required, emptyValidator()])
    });
    this.statesStateService.currentState$.subscribe((state) => {
      if (state !== null) {
        this.state = state;
        this.editStateForm.patchValue(state);
        this.editStateForm.updateValueAndValidity();
      }
    })
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
    this.stateServiceUtils.updateState(state).subscribe({
      next: (savedState) => this.handleSaveStateSuccess(savedState),
      error: (err) => this.handleSaveStateError(err)
    })
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
    if (error instanceof Error && error.message?.includes('version mismatch')) {
      this.showOCCErrorModaState = true;
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
