import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ProjectStatusUtils } from '../../utils/project-status-utils';
import { catchError, switchMap, finalize, tap } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

@Component({
  selector: 'app-model-project-status',
  standalone: false,
  templateUrl: './model-project-status.component.html',
  styleUrl: './model-project-status.component.scss'
})
export class ModelProjectStatusComponent implements OnInit {
  private readonly projectStatusUtils = inject(ProjectStatusUtils);
  private readonly subscriptions = new Subscription();
  @ViewChild('projectStatusInput') projectStatusInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() projectStatusToDelete: number | null = null;
  @Input() projectStatusName: string | null = null;
  @Output() isVisibleModel = new EventEmitter<boolean>();
  @Output() projectStatusCreated = new EventEmitter<void>();
  @Output() toastMessage  = new EventEmitter<{severity: string, summary: string, detail: string}>();

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
    this.loadInitialData()
    this.resetForm();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private loadInitialData(){
    const sub = this.projectStatusUtils.loadInitialData().subscribe()
    this.subscriptions.add(sub);
  }
  onDeleteConfirm(): void {
    this.isLoading = true;
    if(this.projectStatusToDelete){
      const sub = this.projectStatusUtils.deleteProjectStatus(this.projectStatusToDelete).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastMessage.emit({
            severity: 'success',
            summary: 'MESSAGE.SUCCESS',
            detail: 'MESSAGE.DELETE_SUCCESS'
          });
          this.closeModel();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message ?? 'Failed to delete projectStatus';
          this.toastMessage.emit({
            severity: 'error',
            summary: 'MESSAGE.ERROR',
            detail: this.errorMessage?.includes('it is in use by other entities') 
            ? 'MESSAGE.DELETE_FAILED_IN_USE' 
            : 'MESSAGE.DELETE_FAILED'
          });
        console.error('Error deleting projectStatus:', error);
        this.closeModel();
        }
      });
      this.subscriptions.add(sub);
    }
  }

  onSubmit(): void { //Aqui se debe cambiar el nombre de la funcion
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const projectStatusName = this.getSanitizedProjectStatusName();

    const sub =  this.projectStatusUtils.addProjectStatus(projectStatusName).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => {
        console.log('Entró a error del subscribe');
        this.handleError(error);}
    });
    this.subscriptions.add(sub);
  }

  private handleSuccess(): void {
    this.toastMessage.emit({
      severity: 'success',
      summary: 'MESSAGE.SUCCESS',
      detail: 'MESSAGE.CREATE_SUCCESS'
    });
    this.projectStatusCreated.emit();
    this.handleClose();
  }

  private handleError(error: any): void {
    this.errorMessage = error?.message ?? 'TITLE.ERROR.CREATION_FAILED';

    const detail = this.getErrorDetail(error.message);

    this.toastMessage.emit({
      severity: 'error',
      summary: 'MESSAGE.ERROR',
      detail
    });

    console.error('Creation error:', error);
  }

  private getErrorDetail(errorCode: string): string {
    switch (errorCode) {
      case 'TITLE.ERROR.EMPTY':
        return 'MESSAGE.EMPTY_ERROR';
      case 'TITLE.ERROR.ALREADY_EXISTS':
        return 'MESSAGE.RECORD_ALREADY_EXISTS';
      default:
        return 'MESSAGE.CREATE_FAILED';
    }
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


  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModel.emit(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.createdProjectStatusForm.reset();
  }

 

  closeModel(): void {
    this.isVisibleModel.emit(false);
    this.createdProjectStatusForm.reset();
  }

  onCancel(): void {
    this.handleClose();
  }
  public focusInputIfNeeded() {
    if (this.isCreateMode && this.projectStatusInput) {
      setTimeout(() => {
        if (this.projectStatusInput?.nativeElement) {
          this.projectStatusInput.nativeElement.focus();
        }
      }, 150);
    }
  }

}
