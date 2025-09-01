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
import { EmployeeIwsUtils } from '../../utils/employee-iws-utils';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { EmployeeIws } from '../../../../../../Entities/employeeIws';
import {
  momentCreateDate,
  momentFormatDate,
} from '../../../../../shared/utils/moment-date-utils';

@Component({
  selector: 'app-iws-staff-modal',
  standalone: false,
  templateUrl: './iws-staff-modal.component.html',
  styleUrl: './iws-staff-modal.component.scss',
})
export class IwsStaffModalComponent implements OnInit, OnDestroy {
  private readonly employeeIwsUtils = inject(EmployeeIwsUtils);
  private readonly subscriptions = new Subscription();

  teams = [
    { name: 'Team 1', code: 'T1' },
    { name: 'Team 2', code: 'T2' },
    { name: 'Team 3', code: 'T3' },
  ];

  @ViewChild('employeeIwsInput')
  employeeIwsInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() employeeIwsToDelete: number | null = null;
  @Input() employeeIwsName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() employeeIwsCreated = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{
    severity: string;
    summary: string;
    detail: string;
  }>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly createEmployeeIwsForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
    lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),
    mail: new FormControl('', [Validators.required, Validators.email]),
    employeeNo: new FormControl(0, [Validators.pattern(/^-?(0|[1-9]\d*)?$/)]),
    employeeLabel: new FormControl('', []),
    startDate: new FormControl('', []),
    endDate: new FormControl('', []),
    teamIws: new FormControl(null, []),
    user: new FormControl(null, []),
    active: new FormControl(0, []),
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();
  }

  private loadInitialData() {
    const sub = this.employeeIwsUtils.loadInitialData().subscribe();
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
    if (!this.employeeIwsToDelete) return;
    this.isLoading = true;

    const sub = this.employeeIwsUtils
      .deleteEmployeeIws(this.employeeIwsToDelete)
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
    if (this.createEmployeeIwsForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    const EmployeeIwsData = this.getSanitizedEmployeeIwsValues();

    const sub = this.employeeIwsUtils
      .addEmployeeIws(EmployeeIwsData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.employeeIwsCreated.emit();
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

  private getSanitizedEmployeeIwsValues(): Omit<
    EmployeeIws,
    'id' | 'createdAt' | 'updatedAt' | 'version'
  > {
    return {
      firstname: this.createEmployeeIwsForm.value.firstName?.trim() ?? '',
      lastname: this.createEmployeeIwsForm.value.lastName?.trim() ?? '',
      mail: this.createEmployeeIwsForm.value.mail?.trim() ?? '',
      startDate: this.createEmployeeIwsForm.value.startDate
        ? momentFormatDate(
            momentCreateDate(this.createEmployeeIwsForm.value.startDate)
          )
        : '',
      endDate: this.createEmployeeIwsForm.value.endDate
        ? momentFormatDate(
            momentCreateDate(this.createEmployeeIwsForm.value.endDate)
          )
        : '',
      employeeNo: this.createEmployeeIwsForm.value.employeeNo ?? 1,
      employeeLabel:
        this.createEmployeeIwsForm.value.employeeLabel?.trim() ?? '',
      teamIws: null,
      user: this.createEmployeeIwsForm.value.user ?? null,
      active: this.createEmployeeIwsForm.value.active ?? 1,
    };
  }

  private resetForm(): void {
    this.createEmployeeIwsForm.reset();
  }

  onCancel(): void {
    this.closeAndReset();
  }

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.employeeIwsInput) {
      setTimeout(() => {
        this.employeeIwsInput?.nativeElement?.focus();
      }, 150);
    }
  }
}
