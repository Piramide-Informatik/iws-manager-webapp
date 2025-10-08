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
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { EmployeeIwsUtils } from '../../utils/employee-iws-utils';
import { TeamIwsService } from '../../../../../../Services/team-iws.service';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { EmployeeIws } from '../../../../../../Entities/employeeIws';
import {
  momentCreateDate,
  momentFormatDate,
} from '../../../../../shared/utils/moment-date-utils';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-iws-staff-modal',
  standalone: false,
  templateUrl: './iws-staff-modal.component.html',
  styleUrl: './iws-staff-modal.component.scss',
})
export class IwsStaffModalComponent implements OnInit, OnDestroy, OnChanges {
  private readonly employeeIwsUtils = inject(EmployeeIwsUtils);
  private readonly teamIwsService = inject(TeamIwsService);
  private readonly subscriptions = new Subscription();

  teams: any[] = [];
  @ViewChild('fisrtInput') firstInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visibleModal: boolean = false;
  @Input() employeeIwsToDelete: number | null = null;
  @Input() employeeIwsName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() employeeIwsCreated = new EventEmitter<void>();
  @Output() employeeIwsDeleted = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{
    severity: string;
    summary: string;
    detail: string;
  }>();

  isLoading = false;
  errorMessage: string | null = null;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalIWSStaff = false;

  readonly createEmployeeIwsForm = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
    lastName: new FormControl('', [
      Validators.minLength(2),
      Validators.maxLength(50),
    ]),
    mail: new FormControl('', [Validators.email]),
    employeeNo: new FormControl<number | null>({ value: null, disabled: true }),
    employeeLabel: new FormControl(''),
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    teamIws: new FormControl(null),
    user: new FormControl(null),
    active: new FormControl(false),
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.loadTeams();
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visibleModal'] && this.visibleModal) {
      if (this.isCreateMode) {
        this.loadNextEmployeeNo(); // cargar número al abrir modal
      }
      setTimeout(() => {
        this.focusInputIfNeeded();
      });
    }
  }

  private loadInitialData() {
    const sub = this.employeeIwsUtils.loadInitialData().subscribe();
    this.subscriptions.add(sub);
  }

  private loadTeams() {
    const sub = this.teamIwsService.getAllTeamsIws().subscribe({
      next: (data) => (this.teams = data),
      error: (err) => console.error('Error loading teams', err),
    });
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
        next: () => {
          this.employeeIwsDeleted.emit();
          this.showToastAndClose('success', 'MESSAGE.DELETE_SUCCESS');
        },
        error: (error) => {
          this.handleDeleteError(error);
          this.handleOperationError(
            error,
            'MESSAGE.DELETE_FAILED',
            'MESSAGE.DELETE_ERROR_IN_USE'
          );
        },
      });

    this.subscriptions.add(sub);
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalIWSStaff = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
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
      employeeNo: Number(this.createEmployeeIwsForm.value.employeeNo),
      employeeLabel:
        this.createEmployeeIwsForm.value.employeeLabel?.trim() ?? '',
      teamIws: this.createEmployeeIwsForm.value.teamIws ?? null,
      user: this.createEmployeeIwsForm.value.user ?? null,
      active: this.createEmployeeIwsForm.value.active ? 1 : 0,
    };
  }

  private resetForm(): void {
    this.createEmployeeIwsForm.reset();
  }

  onCancel(): void {
    this.closeAndReset();
  }

  private focusInputIfNeeded() {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        this.firstInput?.nativeElement?.focus();
      }, 300);
    }
  }

  private loadNextEmployeeNo(): void {
    const sub = this.employeeIwsUtils.getNextEmployeeNo().subscribe({
      next: (nextNo) => {
        if (nextNo != null) {
          this.createEmployeeIwsForm.patchValue({ employeeNo: nextNo });
        }
      },
      error: (err) => console.error('Error loading next employeeNo', err),
    });
    this.subscriptions.add(sub);
  }
}
