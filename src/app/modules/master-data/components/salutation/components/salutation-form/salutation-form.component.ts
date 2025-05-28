import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Salutation } from '../../../../../../Entities/salutation';
import { SalutationUtils } from '../../utils/salutation.utils';
import { SalutationStateService } from '../../utils/salutation-state.service';

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
  private readonly subscriptions = new Subscription();
  private readonly editSalutationSource = new BehaviorSubject<Salutation | null>(null);

  constructor(
    private readonly salutationUtils: SalutationUtils,
    private readonly salutationStateService: SalutationStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.setupSalutationSubscription();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  setSalutationToEdit(salutation: Salutation | null) {
    this.editSalutationSource.next(salutation);
  }

  private initForm(): void {
    this.editSalutationForm = new FormGroup({
      salutation: new FormControl('', [Validators.required])
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
      name: this.editSalutationForm.value.salutation
    };

    this.subscriptions.add(
      this.salutationUtils.updateSalutation(updatedSalutation).subscribe({
        next: (savedSalutation) => this.handleSaveSuccess(savedSalutation),
        error: (err) => this.handleSaveError(err)
      })
    );
  }

  private handleSaveSuccess(savedSalutation: Salutation): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('SALUTATION.MESSAGE.SUCCESS'),
      detail: this.translate.instant('SALUTATION.MESSAGE.UPDATE_SUCCESS')
    });
    this.salutationStateService.setSalutationToEdit(null);
    this.clearForm();
  }

  private handleSaveError(error: any): void {
    console.error('Error saving salutation:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('SALUTATION.MESSAGE.ERROR'),
      detail: this.translate.instant('SALUTATION.MESSAGE.UPDATE_FAILED')
    });
    this.isSaving = false;
  }

  private markAllAsTouched(): void {
    Object.values(this.editSalutationForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }
}