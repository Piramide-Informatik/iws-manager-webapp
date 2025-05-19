import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'app-funding-programs-table',
  templateUrl: './funding-programs-table.component.html',
  styleUrls: ['./funding-programs-table.component.scss'],
  standalone: false,
})
export class FundingProgramsTableComponent implements OnInit, OnDestroy {
  fundingProgramsUI: any[] = [];
  columnsHeaderFieldFundingProgram: any[] = [];
  userPreferences: UserPreference = {};
  tableKey: string = 'FundingPrograms'
  dataKeys = ['program', 'rate'];
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {
    this.fundingProgramsUI = [
      { id: 1, program: 'BMWi', rate: 25 },
      { id: 2, program: 'ZIM', rate: 45 },
      { id: 3, program: 'Eurostars', rate: 30 },
      { id: 4, program: 'Marketing', rate: 20 },
      { id: 5, program: 'FUE-Verw', rate: 40 },
      { id: 6, program: 'FZ', rate: 35 },
      { id: 7, program: 'Go-Inno', rate: 28 },
      { id: 8, program: 'GreenEconomy.IN.NRW', rate: 50 },
      { id: 9, program: 'KMU-Innovativ', rate: 38 },
      { id: 10, program: 'LuFo', rate: 32 },
      { id: 11, program: 'Messe', rate: 22 },
      { id: 12, program: 'NEXT.IN.NRW', rate: 27 },
      { id: 13, program: 'Sonstiges', rate: 33 },
      { id: 14, program: 'Studie', rate: 18 },
    ];

    this.loadColHeadersFundingProgram();
    this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldFundingProgram);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersFundingProgram();
      this.routerUtils.reloadComponent(true);
      this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldFundingProgram);
    });
  }

  onUserPreferencesChanges(userPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }

  loadColHeadersFundingProgram(): void {
    this.columnsHeaderFieldFundingProgram = [
      {
        field: 'program',
        styles: { width: 'auto' },
        header: this.translate.instant(_('FUNDING.TABLE.PROGRAM')),
      },
      {
        field: 'rate',
        styles: { width: '100px' },
        header: this.translate.instant(_('FUNDING.TABLE.RATE')),
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
