import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TitleUtils } from '../../utils/title-utils';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-title-modal',
  standalone: false,
  templateUrl: './title-modal.component.html',
  styleUrls: ['./title-modal.component.scss']
})
export class TitleModalComponent implements OnInit {
  private readonly titleUtils = inject(TitleUtils);
  
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() titleCreated = new EventEmitter<void>();

  readonly createTitleForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ])
  });

  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.resetForm();
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const titleName = this.getSanitizedTitleName();

    this.titleUtils.titleExists(titleName).pipe(
      switchMap(exists => this.handleTitleExistence(exists, titleName)),
      catchError(err => this.handleError('TITLE.ERROR.CHECKING_DUPLICATE', err)),
      finalize(() => this.isLoading = false)
    ).subscribe();

    this.handleClose();
  }

  private shouldPreventSubmission(): boolean {
    return this.createTitleForm.invalid || this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private getSanitizedTitleName(): string {
    return this.createTitleForm.value.name?.trim() ?? '';
  }

  private handleTitleExistence(exists: boolean, titleName: string) {
    if (exists) {
      this.errorMessage = 'TITLE.ERROR.ALREADY_EXISTS';
      return of(null);
    }

    return this.titleUtils.createNewTitle(titleName).pipe(
      catchError(err => this.handleError('TITLE.ERROR.CREATION_FAILED', err))
    );
  }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    console.error('Error:', error);
    return of(null);
  }

  private resetForm(): void {
    this.createTitleForm.reset();
  }

  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  onCancel(): void {
    this.handleClose();
  }
}