import {
  Component,
  EventEmitter,
  Output,
  inject,
  OnInit,
  Input,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeCategoryUtils } from '../../utils/employee-category-utils';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { EmployeeCategory } from '../../../../../../Entities/employee-category ';

@Component({
  selector: 'app-employee-qualification-modal',
  standalone: false,
  templateUrl: './employee-qualification-modal.component.html',
  styleUrl: './employee-qualification-modal.component.scss',
})
export class EmployeeQualificationModalComponent implements OnInit, OnDestroy {
  private readonly employeeCategoryUtils = inject(EmployeeCategoryUtils);
  private readonly subscriptions = new Subscription();

  @ViewChild('employeeCategoryInput')
  employeeCategoryInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() employeeCategoryToDelete: number | null = null;
  @Input() employeeCategoryName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() employeeCategoryCreated = new EventEmitter<void>();
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

  closeAndReset(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  onDeleteConfirm(): void {
    if (!this.employeeCategoryToDelete) return;
    this.isLoading = true;

    const sub = this.employeeCategoryUtils
      .deleteEmployeeCategory(this.employeeCategoryToDelete)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.showToastAndClose('success', 'MESSAGE.DELETE_SUCCESS'),
        error: (error) =>
          this.handleOperationError(
            error,
            'MESSAGE.DELETE_FAILED',
            'MESSAGE.DELETE_ERROR_IN_USE'
          ),
      });

    this.subscriptions.add(sub);
  }

  onSubmit(): void {
    if (this.createEmployeeCategoryForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    const EmployeeCategoryData = this.getSanitizedEmployeeCategoryValues();

    const sub = this.employeeCategoryUtils
      .addEmployeeCategory(EmployeeCategoryData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.employeeCategoryCreated.emit();
          this.showToastAndClose('success', 'MESSAGE.CREATE_SUCCESS');
        },
        error: (error) =>
          this.handleOperationError(error, 'MESSAGE.CREATE_FAILED'),
      });

    this.subscriptions.add(sub);
  }

  private showToastAndClose(severity: string, detail: string): void {
    this.toastMessage.emit({
      severity,
      summary: severity === 'success' ? 'MESSAGE.SUCCESS' : 'MESSAGE.ERROR',
      detail,
    });
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

    this.toastMessage.emit({
      severity: 'error',
      summary: 'MESSAGE.ERROR',
      detail,
    });

    console.error('Operation error:', error);
    this.closeAndReset();
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
      }, 150);
    }
  }
}
