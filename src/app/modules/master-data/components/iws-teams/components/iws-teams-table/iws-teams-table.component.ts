import { Component, OnInit, OnDestroy, inject, computed, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

import { TeamIwsService } from '../../../../../../Services/team-iws.service';
import { TeamIwsUtils } from '../../utils/iws-team-utils';
import { TeamIws } from '../../../../../../Entities/teamIWS';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { TeamIwsStateService } from '../../utils/iws-team-state.service';
import { IwsTeamsModalComponent } from '../iws-teams-modal/iws-teams-modal.component';

@Component({
  selector: 'app-iws-teams-table',
  standalone: false,
  templateUrl: './iws-teams-table.component.html',
  styles: ``,
})
export class IwsTeamsTableComponent implements OnInit, OnDestroy {
  private readonly teamIwsService = inject(TeamIwsService);
  private readonly teamIwsUtils = new TeamIwsUtils();
  private readonly messageService = inject(MessageService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedTeamIws: number | null = null;
  TeamIwsName: string = '';
  @ViewChild('IwsTeamsModalComponent')
  iwsTeamsModalComponent!: IwsTeamsModalComponent;
  handleTableEvents(event: { type: 'create' | 'delete'; data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedTeamIws = event.data;
      this.teamIwsUtils.getTeamIwsById(this.selectedTeamIws!).subscribe({
        next: (teamIws) => {
          this.TeamIwsName = teamIws?.name?.toString() ?? '';
        },
        error: (err) => {
          console.error('Could not get teamIws:', err);
          this.TeamIwsName = '';
        },
      });
    }
    this.visibleModal = true;
  }
  readonly teams = computed(() => {
    return this.teamIwsService.teamsIws().map((teamiws) => ({
      id: teamiws.id,
      name: teamiws.name,
      //teamleader: teamiws.teamleader
    }));
  });

  IwsTeams: any[] = [];
  columnsHeaderIwsTeams: any[] = [];
  private langSubscription!: Subscription;
  userIwsTeamsPreferences: UserPreference = {};
  tableKey: string = 'IwsTeams';
  dataKeys = ['name'];

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly teamIwsStateService: TeamIwsStateService
  ) {}

  ngOnInit(): void {
    // this.IwsTeams = [
    //   { id: 1, name: 'Team1' },
    //   { id: 2, name: 'Team2' },
    //   { id: 3, name: 'Team3' },
    //   { id: 4, name: 'TeamInno' },
    //   { id: 5, name: 'TeamOpti' },
    //   { id: 6, name: 'TeamVision' },
    //   { id: 7, name: 'TeamAgile' },
    //   { id: 8, name: 'TeamAlpha' },
    //   { id: 9, name: 'TeamBeta' },
    //   { id: 10, name: 'TeamDelta' },
    // ];

    this.loadColumnsIwsTeams();
    this.userIwsTeamsPreferences =
      this.userPreferenceService.getUserPreferences(
        this.tableKey,
        this.columnsHeaderIwsTeams
      );
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumnsIwsTeams();
      this.routerUtils.reloadComponent(true);
      this.userIwsTeamsPreferences =
        this.userPreferenceService.getUserPreferences(
          this.tableKey,
          this.columnsHeaderIwsTeams
        );
    });
  }

  onUserIwsTeamsPreferencesChanges(userIwsTeamsPreferences: any) {
    localStorage.setItem(
      'userPreferences',
      JSON.stringify(userIwsTeamsPreferences)
    );
  }

  loadColumnsIwsTeams(): void {
    this.columnsHeaderIwsTeams = [
      {
        field: 'name',
        header: this.translate.instant(_('IWS_TEAMS.LABEL.TEAM_NAME')),
        styles: { width: 'auto' },
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onDialogShow() {
    if (this.modalType === 'create' && this.iwsTeamsModalComponent) {
      this.iwsTeamsModalComponent.focusInputIfNeeded();
    }
  }
  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedTeamIws = null;
    }
  }

  toastMessageDisplay(message: {
    severity: string;
    summary: string;
    detail: string;
  }): void {
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    });
  }

  editTeamIws(teamIws: TeamIws) {
    const TeamIwsToEdit: TeamIws = {
      id: teamIws.id,
      name: teamIws.name,
      teamleader: teamIws.teamleader,
      teamiws: teamIws.teamiws,
      createdAt: '',
      updatedAt: '',
      version: 0,
    };
    this.teamIwsUtils
      .getTeamIwsById(TeamIwsToEdit.id)
      .subscribe({
        next: (fullTeamIws) => {
          if (fullTeamIws) {
            this.teamIwsStateService.setTeamIwsToEdit(
              fullTeamIws
            );
          }
        },
        error: (err) => {
          console.error('Error Id fullTeamIws', err);
        },
      });
  }
}
