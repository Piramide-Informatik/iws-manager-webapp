import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ProjectStatusUtils } from '../../utils/project-status-utils';
import {  finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';


@Component({
  selector: 'app-model-project-status',
  standalone: false,
  templateUrl: './model-project-status.component.html',
  styleUrl: './model-project-status.component.scss'
})
export class ModelProjectStatusComponent implements OnInit, OnChanges{
  private readonly projectStatusUtils = inject(ProjectStatusUtils);
  private readonly subscriptions = new Subscription();
  @ViewChild('projectStatusInput') projectStatusInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visible: boolean = false;
  @Input() projectStatusToDelete: number | null = null;
  @Input() projectStatusName: string | null = null;
  @Output() isVisibleModel = new EventEmitter<boolean>();
  @Output() projectStatusCreated = new EventEmitter<void>();
  @Output() projectStatusDeleted = new EventEmitter<void>();
  @Output() toastMessage  = new EventEmitter<{severity: string, summary: string, detail: string}>();

  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalProjectStatus = false;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(private readonly commonMessageService: CommonMessagesService) {}
  
  readonly createdProjectStatusForm = new FormGroup({
    name: new FormControl('')
  });

  ngOnInit(): void {
    this.loadInitialData()
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
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
          this.projectStatusDeleted.emit();
          this.toastMessage.emit({
            severity: 'success',
            summary: 'MESSAGE.SUCCESS',
            detail: 'MESSAGE.DELETE_SUCCESS'
          });
          this.closeModel();
        },
        error: (error) => {
          this.isLoading = false;
          this.handleEntityRelatedError(error);
          this.handleOccDeleteError(error);
          this.toastMessage.emit({
            severity: 'error',
            summary: 'MESSAGE.ERROR',
            detail: 'MESSAGE.DELETE_FAILED'
          });
        }
      });
      this.subscriptions.add(sub);
    }
  }
  private handleEntityRelatedError(error: any): void {
    if(error.error?.message?.includes('a foreign key constraint fails')) {
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
    }
  }

  private handleOccDeleteError(error: any): void {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalProjectStatus= true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  onSubmit(): void { 
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const projectStatusName = this.getSanitizedProjectStatusName();

    const sub =  this.projectStatusUtils.addProjectStatus(projectStatusName).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => {
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
    this.errorMessage = error?.message ?? 'PROJECT_STATUS.ERROR.CREATION_FAILED';

    const detail = this.getErrorDetail(error.message);

    this.toastMessage.emit({
      severity: 'error',
      summary: 'MESSAGE.ERROR',
      detail
    });

  }

  private getErrorDetail(errorCode: string): string {
    switch (errorCode) {
      case 'PROJECT_STATUS.ERROR.EMPTY':
        return 'MESSAGE.EMPTY_ERROR';
      case 'PROJECT_STATUS.ERROR.ALREADY_EXISTS':
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
      }, 200);
    }
  }

}
