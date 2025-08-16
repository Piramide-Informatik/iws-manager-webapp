import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { FundingProgramUtils } from '../../utils/funding-program-utils';
import { FundingProgramService } from '../../../../../../Services/funding-program.service';

@Component({
  selector: 'app-funding-programs-table',
  templateUrl: './funding-programs-table.component.html',
  styleUrls: ['./funding-programs-table.component.scss'],
  standalone: false,
})
export class FundingProgramsTableComponent implements OnInit, OnDestroy {
  private readonly fundingProgramService = inject(FundingProgramService);
  userFundingProgramsPreferences: UserPreference = {};
  columnsHeaderFieldFundingProgram: any[] = [];
  tableKey: string = 'FundingPrograms'
  dataKeys = ['name', 'defaultFundingRate'];
  private langSubscription!: Subscription;

  readonly fundingPrograms = computed(() => {
    return this.fundingProgramService.fundingPrograms()
  });

  constructor(
    private readonly fundingProgramUtils: FundingProgramUtils,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {
    this.fundingProgramUtils.loadInitialData().subscribe();
    this.loadColHeadersFundingProgram();
    this.userFundingProgramsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldFundingProgram);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersFundingProgram();
      this.userFundingProgramsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldFundingProgram);
    });
  }

  onUserFundingProgramsPreferencesChanges(userFundingProgramsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userFundingProgramsPreferences));
  }

  loadColHeadersFundingProgram(): void {
    this.columnsHeaderFieldFundingProgram = [
      {
        field: 'name',
        styles: { width: 'auto' },
        header: this.translate.instant(_('FUNDING.TABLE.PROGRAM')),
      },
      {
        field: 'defaultFundingRate',
        styles: { width: '100px' },
        header: this.translate.instant(_('FUNDING.TABLE.RATE')),
        customClasses: ['align-right']
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
