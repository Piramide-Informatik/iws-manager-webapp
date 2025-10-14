import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeCategoryUtils } from '../../utils/employee-category-utils';
import { finalize } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { EmployeeCategory } from '../../../../../../Entities/employee-category ';
import { EmployeeCategoryStateService } from '../../utils/employee-category-state.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-employee-qualification-modal',
  standalone: false,
  templateUrl: './employee-qualification-modal.component.html',
  styleUrl: './employee-qualification-modal.component.scss',
})
export class EmployeeQualificationModalComponent implements OnInit, OnDestroy, OnChanges {
  private readonly employeeCategoryUtils = inject(EmployeeCategoryUtils);
  private readonly employeeCategoryStateService = inject(EmployeeCategoryStateService);
  private readonly subscriptions = new Subscription();
  public showOCCErrorModalEmployeeCategory = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  @ViewChild('employeeCategoryInput')
  employeeCategoryInput!: ElementRef<HTMLInputElement>;

  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() employeeCategoryToDelete: number | null = null;
  @Input() employeeCategoryName: string | null = null;
  @Input() visibleModal: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() employeeCategoryCreated = new EventEmitter<{ status: 'success' | 'error' }>();
  @Output() toastMessage = new EventEmitter<{
    severity: string;
    summary: string;
    detail: string;
  }>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly createEmployeeCategoryForm = new FormGroup({
    qualification: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
    abbreviation: new FormControl('', [
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visibleModal'] && this.visibleModal) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      });
    }
  }

  private loadInitialData() {
    const sub = this.employeeCategoryUtils.loadInitialData().subscribe();
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private executeOperation(
    operation$: Observable<any>,
    successMessage: string,
    failureMessage: string,
    inUseMessage?: string,
    afterSuccess?: () => void
  ): void {
    this.isLoading = true;
    this.errorMessage = null;

    const sub = operation$
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.employeeCategoryStateService.clearEmployeeCategory();
          afterSuccess?.();
          this.showToastAndClose('success', successMessage);
          this.employeeCategoryCreated.emit({ status: 'success' });
        },
        error: (error) => {
          this.handleDeleteError(error);
          this.handleOperationError(error, failureMessage, inUseMessage);
          this.employeeCategoryCreated.emit({ status: 'error' });
        }
      });

    this.subscriptions.add(sub);
  }

  private handleDeleteError(error: any): void {
    if (error.error instanceof OccError  || error?.message.includes('404')) {
      this.showOCCErrorModalEmployeeCategory = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  closeAndReset(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  onDeleteConfirm(): void {
    if (!this.employeeCategoryToDelete) return;

    this.executeOperation(
      this.employeeCategoryUtils.deleteEmployeeCategory(this.employeeCategoryToDelete),
      'MESSAGE.DELETE_SUCCESS',
      'MESSAGE.DELETE_FAILED',
      'MESSAGE.DELETE_ERROR_IN_USE'
    );
  }

  onSubmit(): void {
    if (this.createEmployeeCategoryForm.invalid || this.isLoading) return;

    const EmployeeCategoryData = this.getSanitizedEmployeeCategoryValues();

    this.executeOperation(
      this.employeeCategoryUtils.addEmployeeCategory(EmployeeCategoryData),
      'MESSAGE.CREATE_SUCCESS',
      'MESSAGE.CREATE_FAILED',
      undefined
    );
  }

  private emitToastAndClose(
    severity: 'success' | 'error',
    detail: string,
    summaryKey?: string
  ): void {
    this.toastMessage.emit({
      severity,
      summary:
        summaryKey ??
        (severity === 'success' ? 'MESSAGE.SUCCESS' : 'MESSAGE.ERROR'),
      detail,
    });
  }

  private showToastAndClose(severity: 'success' | 'error', detail: string): void {
    this.emitToastAndClose(severity, detail);
    this.closeAndReset();
  }

  private handleOperationError(
    error: any,
    defaultDetail: string,
    inUseDetail?: string
  ): void {
    this.errorMessage = error?.message ?? defaultDetail;
    const detail = this.errorMessage?.includes('it is in use by other entities')
      ? inUseDetail ?? defaultDetail
      : this.getErrorDetail(this.errorMessage ?? '');

    this.emitToastAndClose('error', detail, 'MESSAGE.ERROR');
    console.error('Operation error:', error);
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

  private getSanitizedEmployeeCategoryValues(): Omit<
    EmployeeCategory,
    'id' | 'createdAt' | 'updatedAt' | 'version'
  > {
    return {
      title: this.createEmployeeCategoryForm.value.qualification?.trim() ?? '',
      label: this.createEmployeeCategoryForm.value.abbreviation?.trim() ?? '',
    };
  }

  private resetForm(): void {
    this.createEmployeeCategoryForm.reset();
  }

  onCancel(): void {
    this.closeAndReset();
  }

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.employeeCategoryInput) {
      setTimeout(() => {
        this.employeeCategoryInput?.nativeElement?.focus();
      }, 200);
    }
  }
}
