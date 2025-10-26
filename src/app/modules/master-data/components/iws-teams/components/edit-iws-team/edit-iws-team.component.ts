import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TeamIws } from '../../../../../../Entities/teamIWS';
import { map, Subscription, take } from 'rxjs';
import { TeamIwsUtils } from '../../utils/iws-team-utils';
import { EmployeeIwsService } from '../../../../../../Services/employee-iws.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TeamIwsStateService } from '../../utils/iws-team-state.service';
import { EmployeeIws } from '../../../../../../Entities/employeeIws';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-edit-iws-team',
  standalone: false,
  templateUrl: './edit-iws-team.component.html',
  styleUrl: './edit-iws-team.component.scss',
})
export class EditIwsTeamComponent implements OnInit, OnDestroy {
  public showOCCErrorModalTeamIws = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  currentTeamIws: TeamIws | null = null;
  editTeamForm!: FormGroup;

  isSaving = false;
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  private readonly subscriptions = new Subscription();
  public teamNameAlreadyExist = false;

  constructor(
    private readonly teamIwsUtils: TeamIwsUtils,
    private readonly teamIwsStateService: TeamIwsStateService,
    private readonly employeeIwsService: EmployeeIwsService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
    private readonly commonMessageService: CommonMessagesService
  ) { }

  leaders: {
    id: number;
    firstname: string | undefined;
    lastname: string | undefined;
    fullName: string;
    version: number;
  }[] = [];

  leadersMap = new Map<number, EmployeeIws>();

  ngOnInit(): void {
    this.initForm();
    this.loadTeams();
    this.setupTeamIwsSubscription();

    const savedTeamIwsId = localStorage.getItem('selectedTeamIwsId');

    if (savedTeamIwsId) {
      this.loadTeamIwsAfterRefresh(savedTeamIwsId);
      localStorage.removeItem('selectedTeamIwsId');
    }

    this.editTeamForm.get('name')?.valueChanges.subscribe(() => {
      if (this.teamNameAlreadyExist) {
        this.teamNameAlreadyExist = false;
      }
    });
  }

  private initForm(): void {
    this.editTeamForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      teamLeader: new FormControl('', []),
    });
  }

  private setupTeamIwsSubscription(): void {
    this.subscriptions.add(
      this.teamIwsStateService.currentTeamIws$.subscribe((teamIws) => {
        this.currentTeamIws = teamIws;
        teamIws ? this.loadTeamIwsData(teamIws) : this.resetForm(true);
      })
    );
  }

  private loadTeamIwsData(teamIws: TeamIws): void {
    this.editTeamForm.patchValue({
      name: teamIws.name,
      teamLeader: teamIws.teamLeader?.id
    });
    this.focusInputIfNeeded();
  }

  private loadTeams() {
    const sub = this.employeeIwsService.getAllEmployeeIwsSortedByLastname().pipe(
      map(data => data.map(emp => {
        this.leadersMap.set(emp.id, emp);
        return {
          id: emp.id,
          firstname: emp.firstname,
          lastname: emp.lastname,
          fullName: `${emp.lastname}, ${emp.firstname}`,
          version: emp.version
        };
      }))
    ).subscribe({
      next: (data) => (this.leaders = data),
      error: (err) => console.error('Error loading leaders', err),
    });
    this.subscriptions.add(sub);
  }

  private loadTeamIwsAfterRefresh(teamIwsId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.teamIwsUtils.getTeamIwsById(Number(teamIwsId)).subscribe({
        next: (teamIws) => {
          if (teamIws) {
            this.teamIwsStateService.setTeamIwsToEdit(teamIws);
          }
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        },
      })
    );
  }

  onSubmit(): void {
    if (this.editTeamForm.invalid || !this.currentTeamIws || this.isSaving) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    const selectedLeaderId = this.editTeamForm.value.teamLeader;
    const leaderObj = this.leadersMap.get(selectedLeaderId) || null;

    const updateTeamIws: TeamIws = {
      ...this.currentTeamIws,
      name: this.editTeamForm.value.name?.trim(),
      teamLeader: leaderObj
    };
    this.subscriptions.add(
      this.teamIwsUtils.updateTeamIws(updateTeamIws).subscribe({
        next: (savedCommission) => this.handleSaveSuccess(savedCommission),
        error: (err) => this.handleError(err),
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private markAllAsTouched(): void {
    Object.values(this.editTeamForm.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private handleSaveSuccess(savedTeamIws: TeamIws): void {
    this.isSaving = false;
    this.commonMessageService.showEditSucessfullMessage();
    this.teamIwsStateService.clearTeamIws();
    this.resetForm(true);
  }

  private handleError(err: any): void {
    this.isSaving = false;
    if (err instanceof OccError) {
      this.showOCCErrorModalTeamIws = true;
      this.occErrorType = err.errorType;
    } else if (err?.message?.includes('team name already exists')) {
      this.teamNameAlreadyExist = true;
      this.editTeamForm.get('name')?.valueChanges.pipe(take(1))
        .subscribe(() => this.teamNameAlreadyExist = false);
      
      this.commonMessageService.showErrorRecordAlreadyExist();
    } else if (err?.message?.includes('Team name is required')) {
      this.commonMessageService.showErrorEditMessage();
    } else {
      this.commonMessageService.showErrorEditMessage();
    }
  }

  cancelEdit(): void {
    this.resetForm();
    this.teamIwsStateService.clearTeamIws();
  }

  private resetForm(clearCommission = false): void {
    this.editTeamForm.reset();
    this.teamNameAlreadyExist = false;
    if (clearCommission) {
      this.currentTeamIws = null;
    }
  }

  onRefresh(): void {
    if (this.currentTeamIws?.id) {
      localStorage.setItem('selectedTeamIwsId', this.currentTeamIws.id.toString());
      window.location.reload();
    }
  }

  private focusInputIfNeeded(): void {
    if (this.currentTeamIws && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}