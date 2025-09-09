import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { TeamIws } from '../../../../../../Entities/teamIWS';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TeamIwsUtils } from '../../utils/iws-team-utils';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { TeamIwsStateService } from '../../utils/iws-team-state.service';

@Component({
  selector: 'app-edit-iws-team',
  standalone: false,
  templateUrl: './edit-iws-team.component.html',
  styleUrl: './edit-iws-team.component.scss',
})
export class EditIwsTeamComponent implements OnInit {
  public showOCCErrorModalTeamIws = false;
  currentTeamIws: TeamIws | null = null;
  editTeamForm!: FormGroup;

  isSaving = false;
  private readonly subscriptions = new Subscription();
  private readonly editTeamIwsSource = new BehaviorSubject<TeamIws | null>(
    null
  );

  constructor(
    private readonly fb: FormBuilder,
    private readonly teamIwsUtils: TeamIwsUtils,
    private readonly teamIwsStateService: TeamIwsStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
  ) {}

  leaders = [
    { id: 1, fullName: 'Patrick Zessin' },
    { id: 2, fullName: 'Philipp Glockner' },
    { id: 3, fullName: 'Helga Zacherle' },
  ];

  ngOnInit(): void {
    this.initForm();
    this.setupTeamIwsSubscription();

    const savedTeamIwsId = localStorage.getItem('selectedTeamIwsId');

    if (savedTeamIwsId) {
      this.loadTeamIwsAfterRefresh(savedTeamIwsId);
      localStorage.removeItem('selectedTeamIwsId');
    }
  }

  private initForm(): void {
    this.editTeamForm = new FormGroup({
      name: new FormControl('', []),
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
    });
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
    const updateTeamIws: TeamIws = {
      ...this.currentTeamIws,
      name: this.editTeamForm.value.name,
    };
    this.subscriptions.add(
      this.teamIwsUtils.updateTeamIws(updateTeamIws).subscribe({
        next: (savedCommission) => this.handleSaveSuccess(savedCommission),
        error: (err) => this.handleError(err),
      })
    );
  }

  private markAllAsTouched(): void {
    Object.values(this.editTeamForm.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private handleSaveSuccess(savedTeamIws: TeamIws): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('MESSAGE.SUCCESS'),
      detail: this.translate.instant('MESSAGE.UPDATE_SUCCESS'),
    });
    this.teamIwsStateService.setTeamIwsToEdit(null);
    this.resetForm(true);
  }

  private handleError(err: any): void {
    if (
      err.message === 'Version conflict: TeamIws has been updated by another user'
    ) {
      this.showOCCErrorModalTeamIws = true;
    } else {
      console.error('Error saving teamIws:', err);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('MESSAGE.UPDATE_FAILED'),
      });
    }
    this.isSaving = false;
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(clearCommission = false): void {
    this.editTeamForm.reset();
    if (clearCommission) {
      this.currentTeamIws = null;
      this.isSaving = false;
    }
  }

  onRefresh(): void {
    if (this.currentTeamIws?.id) {
      localStorage.setItem(
        'selectedTeamIwsId',
        this.currentTeamIws.id.toString()
      );
      window.location.reload();
    }
  }
}
