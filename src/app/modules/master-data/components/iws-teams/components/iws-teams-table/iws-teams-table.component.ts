import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { RouterUtilsService } from '../../../../router-utils.service';

@Component({
  selector: 'app-iws-teams-table',
  standalone: false,
  templateUrl: './iws-teams-table.component.html',
  styles: ``,
})
export class IwsTeamsTableComponent implements OnInit, OnDestroy {
  IwsTeams: any[] = [];
  columnsHeaderIwsTeams: any[] = [];
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {
    this.IwsTeams = [
      { id: 1, name: 'Team1' },
      { id: 2, name: 'Team2' },
      { id: 3, name: 'Team3' },
      { id: 4, name: 'TeamInno' },
      { id: 5, name: 'TeamOpti' },
      { id: 6, name: 'TeamVision' },
      { id: 7, name: 'TeamAgile' },
      { id: 8, name: 'TeamAlpha' },
      { id: 9, name: 'TeamBeta' },
      { id: 10, name: 'TeamDelta' },
    ];

    this.loadColumnsIwsTeams();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumnsIwsTeams();
      this.routerUtils.reloadComponent(true);
    });
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
}
