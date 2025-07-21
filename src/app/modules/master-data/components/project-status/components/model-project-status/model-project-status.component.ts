import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ProjectStatusUtils } from '../../utils/project-status-utils';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-model-project-status',
  standalone: false,
  templateUrl: './model-project-status.component.html',
  styleUrl: './model-project-status.component.scss'
})
export class ModelProjectStatusComponent implements OnInit {
  private readonly projectStatusUtils = inject(ProjectStatusUtils);
  @ViewChild('projectStatusInput') projectStatusInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() projectStatusToDelete: number | null = null;
  @Input() projectStatusName: string | null = null;
  @Output() isVisibleModel = new EventEmitter<boolean>();
  @Output() projectStatusCreated = new EventEmitter<void>();
  @Output() confirmDeleted = new EventEmitter<{severity: string, summary: string, detail: string}>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly createdProjectStatusForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ])
  });

  ngOnInit(): void {
      this.resetForm();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onDeleteConfirm(): void {
    this.isLoading = true;
    if(this.projectStatusToDelete){
      this.projectStatusUtils.deleteProjectStatus(this.projectStatusToDelete).subscribe({
        next: () => {
          this.isLoading = false;
          this.confirmDeleted.emit({
            severity: 'success',
            summary: 'MESSAGE.SUCCESS',
            detail: 'MESSAGE.DELETE_SUCCESS'
          });
          this.closeModel();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message ?? 'Failed to delete title';
          this.confirmDeleted.emit({
            severity: 'error',
            summary: 'MESSAGE.ERROR',
            detail: this.errorMessage?.includes('it is in use by other entities') ? 'MESSAGE.DELETE_FAILED_IN_USE' : 'MESSAGE.DELETE_FAILED'
          });
        console.error('Error deleting projectStatus:', error);
        this.closeModel();
        }
      })
    }
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const projectStatusName = this.getSanitizedProjectStatusName();

    this.projectStatusUtils.projectExists(projectStatusName).pipe(
      switchMap(exists => this.handleProjectStatusExistence(exists, projectStatusName)),
      finalize(() => this.isLoading = false)
    ).subscribe();
    this.handleClose();
  }

  private shouldPreventSubmission(): boolean {
    return this.createdProjectStatusForm.invalid || this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private getSanitizedProjectStatusName(): string {
    return this.createdProjectStatusForm.value.name?.trim() ?? '';
  }

  private handleProjectStatusExistence(exists: boolean, projectStatusName: string){
    if (exists) {
      this.errorMessage = 'Error: projectStatus already exists';
      return of(null);
    }

    return this.projectStatusUtils.createNewProjectStatus(projectStatusName).pipe(
      catchError(err => this.handleError('creation failed', err)));
  }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    console.error('Error:', error);
    return of(null);
  }

  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModel.emit(false);
    this.resetForm();
  }

  resetForm(): void {
    this.createdProjectStatusForm.reset();
  }
  closeModel(): void {
    this.isVisibleModel.emit(false);
    this.createdProjectStatusForm.reset();
  }

  onCancel(): void {
    this.handleClose();
  }

}
