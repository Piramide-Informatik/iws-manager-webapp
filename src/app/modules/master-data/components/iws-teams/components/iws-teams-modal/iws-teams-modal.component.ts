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
import { TeamIwsUtils } from '../../utils/iws-team-utils';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { TeamIws } from '../../../../../../Entities/teamIWS';

@Component({
  selector: 'app-iws-teams-modal',
  standalone: false,
  templateUrl: './iws-teams-modal.component.html',
  styleUrl: './iws-teams-modal.component.scss',
})
export class IwsTeamsModalComponent {
  private readonly teamIwsUtils = inject(TeamIwsUtils);
  private readonly subscriptions = new Subscription();

  @ViewChild('teamIwsInput')
  teamIwsInput!: ElementRef<HTMLInputElement>;

  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() teamIwsToDelete: number | null = null;
  @Input() teamIwsName: string | null = null;

  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() TeamIwsCreated = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{
    severity: string;
    summary: string;
    detail: string;
  }>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly createTeamIwsForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private loadInitialData() {
    const sub = this.teamIwsUtils.loadInitialData().subscribe();
    this.subscriptions.add(sub);
  }

  private closeModal(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  onCancel(): void {
    this.closeModal();
  }

  onDeleteConfirm(): void {
    if (!this.teamIwsToDelete) return;
    this.isLoading = true;

    const sub = this.teamIwsUtils
      .deleteTeamIws(this.teamIwsToDelete)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.showToastAndClose('success', 'MESSAGE.DELETE_SUCCESS'),
        error: (error) =>
          this.handleErrorWithToast(
            error,
            'MESSAGE.DELETE_FAILED',
            'MESSAGE.DELETE_ERROR_IN_USE'
          ),
      });

    this.subscriptions.add(sub);
  }

  private showToastAndClose(severity: string, detail: string): void {
    this.toastMessage.emit({
      severity,
      summary: severity === 'success' ? 'MESSAGE.SUCCESS' : 'MESSAGE.ERROR',
      detail,
    });
    this.closeModal();
  }

    onSubmit(): void {
    if (this.createTeamIwsForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    const IwsCommissionData = this.getSanitizedTeamIwsValues();

    const sub = this.teamIwsUtils
      .addTeamIws(IwsCommissionData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.TeamIwsCreated.emit();
          this.showToastAndClose('success', 'MESSAGE.CREATE_SUCCESS');
        },
        error: (error) => this.handleErrorWithToast(error, 'MESSAGE.CREATE_FAILED'),
      });

    this.subscriptions.add(sub);
  }
  private handleErrorWithToast(
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
    this.closeModal();
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

  private getSanitizedTeamIwsValues(): Omit<
    TeamIws,
    'id' | 'createdAt' | 'updatedAt' | 'version'
  > {
    return {
      name: this.createTeamIwsForm.value.name?.trim() ?? '',
    };
  }

  private resetForm(): void {
    this.createTeamIwsForm.reset();
  }

  public focusInputIfNeeded(): void {
    if (this.isCreateMode && this.teamIwsInput) {
      setTimeout(() => {
        this.teamIwsInput?.nativeElement?.focus();
      }, 150);
    }
  }
}
