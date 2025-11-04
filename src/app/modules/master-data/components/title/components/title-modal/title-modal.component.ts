import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators, AsyncValidatorFn } from '@angular/forms';
import { TitleUtils } from '../../utils/title-utils';
import { finalize, map, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-title-modal',
  standalone: false,
  templateUrl: './title-modal.component.html',
  styleUrls: ['./title-modal.component.scss']
})

export class TitleModalComponent implements OnInit, OnChanges, OnDestroy {
  private readonly titleUtils = inject(TitleUtils);
  private readonly subscriptions = new Subscription();

  public showOCCErrorModaTitle = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public titleAlreadyExist = false;

  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() titleToDelete: number | null = null;
  @Input() titleName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() titleCreated = new EventEmitter<void>();
  @Output() titleDeleted = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{ severity: string, summary: string, detail: string }>();

  isLoading = false;
  errorMessage: string | null = null;

  constructor(private readonly commonMessageService: CommonMessagesService) { }

  readonly createTitleForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();

     this.createTitleForm.get('name')?.valueChanges.subscribe(() => {
      if (this.titleAlreadyExist) {
        this.titleAlreadyExist = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    
    if (changes['isVisibleModal'] && changes['isVisibleModal'].currentValue === true && this.isCreateMode) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      }, 150);
    }
  }

  private loadInitialData() {
    const sub = this.titleUtils.loadInitialData().subscribe();
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onDeleteConfirm(): void {
    this.isLoading = true;

    if (this.titleToDelete) {
      const sub = this.titleUtils.deleteTitle(this.titleToDelete).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.titleDeleted.emit();
          this.toastMessage.emit({
            severity: 'success',
            summary: 'MESSAGE.SUCCESS',
            detail: 'MESSAGE.DELETE_SUCCESS'
          });
          this.closeModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.handleEntityRelatedError(error)
          this.handleDeleteError(error);
        }
      });

      this.subscriptions.add(sub);
    }
  }
  private handleEntityRelatedError(error: any): void {
    if (error.error?.message?.includes('a foreign key constraint fails')) {
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
      this.closeModal();
    }
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.commonMessageService.showErrorDeleteMessage();
      this.showOCCErrorModaTitle = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const titleName = this.getSanitizedTitleName();

    const sub = this.titleUtils.addTitle(titleName).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => this.handleError(error)
    });

    this.subscriptions.add(sub);
  }

  private handleSuccess(): void {
    this.toastMessage.emit({
      severity: 'success',
      summary: 'MESSAGE.SUCCESS',
      detail: 'MESSAGE.CREATE_SUCCESS'
    });
    this.titleCreated.emit();
    this.handleClose();
  }

  private handleError(error: any): void {
    this.errorMessage = error?.message ?? 'TITLE.ERROR.CREATION_FAILED';

    if (error?.message?.includes('title name already exists') ||
      error?.message?.includes('title already exists') ||
      error?.message?.includes('already exists')) {
      this.titleAlreadyExist = true;
      this.toastMessage.emit({
        severity: 'error',
        summary: 'MESSAGE.ERROR',
        detail: 'MESSAGE.CREATE_FAILED'
      });
    } else if (error?.message?.includes('Title name is required')) {
      this.toastMessage.emit({
        severity: 'error',
        summary: 'MESSAGE.ERROR',
        detail: 'ERROR.FIELD_REQUIRED'
      });
    } else {
      const detail = this.getErrorDetail(error.message);
      this.toastMessage.emit({
        severity: 'error',
        summary: 'MESSAGE.ERROR',
        detail
      });
    }

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
    return this.createTitleForm.invalid || this.isLoading || this.isSaveDisabled;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private getSanitizedTitleName(): string {
    return this.createTitleForm.value.name?.trim() ?? '';
  }

  private resetForm(): void {
    this.createTitleForm.reset();
  }

  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.createTitleForm.reset();
  }

  onCancel(): void {
    this.handleClose();
  }

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.titleInput) {
      setTimeout(() => {
        if (this.titleInput?.nativeElement) {
          this.titleInput.nativeElement.focus();
        }
      }, 150);
    }
  }

  get isSaveDisabled(): boolean {
    const nameValue = this.createTitleForm.get('name')?.value?.trim();
    return this.createTitleForm.invalid || this.isLoading || !nameValue;
  }
}