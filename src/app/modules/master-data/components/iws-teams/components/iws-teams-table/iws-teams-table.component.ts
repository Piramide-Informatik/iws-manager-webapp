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
import { Column } from '../../../../../../Entities/column';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

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
  mapTeamIws = new Map<number, TeamIws>();

  readonly teams = computed(() => {
    return this.teamIwsService.teamsIws().map((teamiws) => {
      this.mapTeamIws.set(teamiws.id, teamiws);
      return {
        id: teamiws.id,
        name: teamiws.name,
        teamLeader: teamiws.teamLeader
          ? `${teamiws.teamLeader.lastname ?? ""} ${teamiws.teamLeader.firstname ?? ""}`.trim()
          : "",
      };
    });
  });

  columnsHeaderIwsTeams: Column[] = [];
  userIwsTeamsPreferences: UserPreference = {};
  tableKey: string = 'IwsTeams';
  dataKeys = ['name', 'teamLeader'];

  @ViewChild('dt2') dt2!: Table;
  @ViewChild('iwsTeamsModal') iwsTeamsModal!: IwsTeamsModalComponent;
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly teamIwsStateService: TeamIwsStateService,
    private readonly commonMessageService: CommonMessagesService
  ) { }

  ngOnInit(): void {


    this.loadColumnsIwsTeams();
    this.userIwsTeamsPreferences = this.userPreferenceService.getUserPreferences(
      this.tableKey,
      this.columnsHeaderIwsTeams
    );
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumnsIwsTeams();
      this.routerUtils.reloadComponent(true);
      this.userIwsTeamsPreferences = this.userPreferenceService.getUserPreferences(
        this.tableKey,
        this.columnsHeaderIwsTeams
      );
    });
  }

  handleTableEvents(event: { type: 'create' | 'delete'; data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedTeamIws = event.data;

      this.TeamIwsName = this.mapTeamIws.get(this.selectedTeamIws ?? 0)?.name ?? '';
    }
    this.visibleModal = true;
  }

  onUserIwsTeamsPreferencesChanges(userIwsTeamsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userIwsTeamsPreferences));
  }

  loadColumnsIwsTeams(): void {
    this.columnsHeaderIwsTeams = [
      {
        field: 'name',
        header: this.translate.instant(_('IWS_TEAMS.LABEL.TEAM_NAME')),
        styles: { 'min-width': '150px' },
        classesTHead: ['width-50'],
        useSameAsEdit: true
      },
      {
        field: 'teamLeader',
        header: this.translate.instant(_('IWS_TEAMS.LABEL.TEAM_LEADER')),
        styles: { 'min-width': '250px' },
        classesTHead: ['width-50'],
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

  onClose() {
    this.iwsTeamsModal.onCancel();
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
    console.log("TOAST MESSAGE", message);
    switch (message.detail) {
      case 'MESSAGE.CREATE_SUCCESS':
        this.commonMessageService.showCreatedSuccesfullMessage();        
        break;
      case 'MESSAGE.CREATE_FAILED':
        this.commonMessageService.showErrorCreatedMessage();        
        break;
      case 'MESSAGE.DELETE_SUCCESS':
        this.commonMessageService.showDeleteSucessfullMessage();        
        break;
      case 'MESSAGE.DELETE_FAILED':
        this.commonMessageService.showErrorDeleteMessage();        
        break;
    
      default:
        break;
    }
    // this.messageService.add({
    //   severity: message.severity,
    //   summary: this.translate.instant(_(message.summary)),
    //   detail: this.translate.instant(_(message.detail)),
    // });
  }

  createTeamIws(event: { status: 'success' | 'error' }): void {
    if (event.status === 'success') {
      const sub = this.teamIwsUtils.loadInitialData().subscribe();
      this.langSubscription.add(sub);
      this.prepareTableData();
    }
  }

  private prepareTableData() {
    if (this.teams().length > 0) {
      this.columnsHeaderIwsTeams = [
        { field: 'name', header: 'teamLeader' }
      ];
    }
  }

  editTeamIws(teamIws: { id: number; name: string | undefined; teamLeader: string; }): void {
    const TeamIwsToEdit = this.mapTeamIws.get(teamIws.id) || null;
    this.teamIwsStateService.setTeamIwsToEdit(TeamIwsToEdit);
  }
}
