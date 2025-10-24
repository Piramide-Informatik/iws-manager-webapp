import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef, OnDestroy, SimpleChanges, OnChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TeamIwsUtils } from '../../utils/iws-team-utils';
import { finalize, map } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { TeamIws } from '../../../../../../Entities/teamIWS';
import { EmployeeIwsService } from '../../../../../../Services/employee-iws.service';
import { TeamIwsStateService } from '../../utils/iws-team-state.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-iws-teams-modal',
  standalone: false,
  templateUrl: './iws-teams-modal.component.html',
  styleUrl: './iws-teams-modal.component.scss',
})
export class IwsTeamsModalComponent implements OnInit, OnDestroy, OnChanges {
  private readonly teamIwsStateService = inject(TeamIwsStateService);
  private readonly teamIwsUtils = inject(TeamIwsUtils);
  private readonly employeeIws = inject(EmployeeIwsService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();

  leaders: any[] = [];
  @ViewChild('firstInput')
  teamIwsInput!: ElementRef<HTMLInputElement>;

  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() teamIwsToDelete: number | null = null;
  @Input() teamIwsName: string | null = null;
  @Input() visibleModal: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createTeamIws = new EventEmitter<{ status: 'success' | 'error' }>();
  @Output() toastMessage = new EventEmitter<{ status: 'success' | 'error'; operation: 'create' | 'delete', error?: any }>();

  isLoading = false;
  errorMessage: string | null = null;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalIwsTeams = false;

  readonly createTeamIwsForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    teamLeader: new FormControl(null, [])
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.loadTeams()
    this.resetForm();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visibleModal'] && this.visibleModal) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private loadInitialData(): void {
    this.addSubscription(this.teamIwsUtils.loadInitialData().subscribe());
  }

  private loadTeams() {
    const sub = this.employeeIws.getAllEmployeeIwsSortedByLastname().pipe(
      map(data => data.map(emp => ({
        id: emp.id,
        firstname: emp.firstname,
        lastname: emp.lastname,
        fullName: `${emp.lastname} ${emp.firstname}`,
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

    this.handleRequest(this.teamIwsUtils.deleteTeamIws(this.teamIwsToDelete), 'delete');
  }

  onSubmit(): void {
    if (this.createTeamIwsForm.invalid || this.isLoading) return;
    this.isLoading = true;
    this.errorMessage = null;

    const data = this.getSanitizedTeamIwsValues();
    this.handleRequest(this.teamIwsUtils.addTeamIws(data), 'create');
  }

  // ------------------------ Helpers ------------------------

  private handleRequest(request$: Observable<any>, operation: 'create' | 'delete'): void {
    this.addSubscription(
      request$
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            this.teamIwsStateService.clearTeamIws();
            if (operation === 'create') {
              this.createTeamIws.emit({ status: 'success' });
            }
            this.toastMessage.emit({ status: 'success', operation })
            this.closeModal();
          },
          error: (error) => {
            this.handleDeleteError(error);
            this.handleErrorWithToast(error, operation);
          }
        })
    );
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalIwsTeams = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  private handleErrorWithToast(error: any, operation: 'create' | 'delete'): void {

    this.toastMessage.emit({ status: 'error', operation , error });
  }

  private getSanitizedTeamIwsValues(): Omit<TeamIws, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
    return {
      name: this.createTeamIwsForm.value.name?.trim() ?? '',
      teamLeader: this.createTeamIwsForm.value.teamLeader ?? null
    };
  }

  private resetForm(): void {
    this.createTeamIwsForm.reset();
  }

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.teamIwsInput) {
      setTimeout(() => {
        this.teamIwsInput?.nativeElement?.focus();
      }, 200);
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
