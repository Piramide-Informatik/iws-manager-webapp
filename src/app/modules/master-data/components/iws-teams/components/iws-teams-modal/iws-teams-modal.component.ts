import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TeamIwsUtils } from '../../utils/iws-team-utils';
import { finalize, map } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { TeamIws } from '../../../../../../Entities/teamIWS';
import { EmployeeIwsService } from '../../../../../../Services/employee-iws.service';

@Component({
  selector: 'app-iws-teams-modal',
  standalone: false,
  templateUrl: './iws-teams-modal.component.html',
  styleUrl: './iws-teams-modal.component.scss',
})
export class IwsTeamsModalComponent implements OnInit, OnDestroy {
  private readonly teamIwsUtils = inject(TeamIwsUtils);
  private readonly employeeIws=  inject(EmployeeIwsService);
  private readonly subscriptions = new Subscription();

  leaders: any[] = [];
  @ViewChild('teamIwsInput')
  teamIwsInput!: ElementRef<HTMLInputElement>;

  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() teamIwsToDelete: number | null = null;
  @Input() teamIwsName: string | null = null;

  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() teamIwsCreated = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{ severity: string; summary: string; detail: string }>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly createTeamIwsForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    teamLeader: new FormControl(null,[])
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.loadTeams()
    this.resetForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private loadInitialData(): void {
    this.addSubscription(this.teamIwsUtils.loadInitialData().subscribe());
  }

  private loadTeams() {
    const sub = this.employeeIws.getAllEmployeeIws().pipe(
    map(data => data.map(emp => ({
      id: emp.id,
      firstname: emp.firstname,
      lastname: emp.lastname,
      fullName: `${emp.firstname} ${emp.lastname}`,
      version: emp.version
    })))
  ).subscribe({
    next: (data) => (this.leaders = data),
    error: (err) => console.error('Error loading leaders', err),
  });
  this.subscriptions.add(sub);
  }

  onCancel(): void {
    this.closeModal();
  }

  onDeleteConfirm(): void {
    if (!this.teamIwsToDelete) return;
    this.isLoading = true;

    this.handleRequest(
      this.teamIwsUtils.deleteTeamIws(this.teamIwsToDelete),
      'MESSAGE.DELETE_SUCCESS',
      'MESSAGE.DELETE_FAILED',
      'MESSAGE.DELETE_ERROR_IN_USE'
    );
  }

  onSubmit(): void {
    if (this.createTeamIwsForm.invalid || this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = null;

    const data = this.getSanitizedTeamIwsValues();
    this.handleRequest(this.teamIwsUtils.addTeamIws(data), 'MESSAGE.CREATE_SUCCESS', 'MESSAGE.CREATE_FAILED');
  }

  // ------------------------ Helpers ------------------------

  private handleRequest(
    request$: Observable<any>,
    successDetail: string,
    errorDetail: string,
    inUseDetail?: string
  ): void {
    this.addSubscription(
      request$
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            if (successDetail === 'MESSAGE.CREATE_SUCCESS') this.teamIwsCreated.emit();
            this.showToastAndClose('success', successDetail);
          },
          error: (error) => this.handleErrorWithToast(error, errorDetail, inUseDetail),
        })
    );
  }

  private showToastAndClose(severity: string, detail: string): void {
    this.toastMessage.emit({
      severity,
      summary: severity === 'success' ? 'MESSAGE.SUCCESS' : 'MESSAGE.ERROR',
      detail,
    });
    this.closeModal();
  }

  private handleErrorWithToast(error: any, defaultDetail: string, inUseDetail?: string): void {
    const errorMessage = error?.message ?? defaultDetail;
    const detail = errorMessage.includes('it is in use by other entities') ? inUseDetail ?? defaultDetail : this.getErrorDetail(errorMessage);

    this.toastMessage.emit({ severity: 'error', summary: 'MESSAGE.ERROR', detail });
    console.error('Operation error:', error);
    this.closeModal();
  }

  private getErrorDetail(code: string): string {
    switch (code) {
      case 'TITLE.ERROR.EMPTY':
        return 'MESSAGE.EMPTY_ERROR';
      case 'TITLE.ERROR.ALREADY_EXISTS':
        return 'MESSAGE.RECORD_ALREADY_EXISTS';
      default:
        return 'MESSAGE.CREATE_FAILED';
    }
  }

  private getSanitizedTeamIwsValues(): Omit<TeamIws, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
    return { 
      name: this.createTeamIwsForm.value.name?.trim() ?? '',
      teamLeader: this.createTeamIwsForm.value.teamLeader ?? null };
  }

  private resetForm(): void {
    this.createTeamIwsForm.reset();
  }

  public focusInputIfNeeded(): void {
    if (this.isCreateMode && this.teamIwsInput) {
      setTimeout(() => this.teamIwsInput?.nativeElement?.focus(), 150);
    }
  }

  private closeModal(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  private addSubscription(sub: Subscription): void {
    this.subscriptions.add(sub);
  }
}
