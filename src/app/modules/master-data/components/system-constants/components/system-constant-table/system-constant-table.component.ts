import { Component, ViewChild, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { SystemConstantUtils } from '../../utils/system-constant.utils';
import { SystemConstantService } from '../../../../../../Services/system-constant.service';

@Component({
  selector: 'app-system-constant-table',
  standalone: false,
  templateUrl: './system-constant-table.component.html',
  styleUrl: './system-constant-table.component.scss'
})
export class SystemConstantTableComponent implements OnInit, OnDestroy {

  private readonly systemConstantUtils =  inject(SystemConstantUtils);
  private readonly systemConstantService = inject(SystemConstantService);
  systemConstantsColumns: any[] = [];
  isSystemConstantsChipVisible = false;
  userSystemConstantPreferences: UserPreference = {};
  tableKey: string = 'SystemConstant'
  dataKeys = ['name', 'value'];

  @ViewChild('dt') dt!: Table;

  readonly systemConstantsValues = computed(() => {
    return this.systemConstantService.systems().map(data => {
      return {
        id: data.id,
        name: data.name,
        value: data.valueChar ?? data.valueNum
      }
    });
  });

  private langConstantsSubscription!: Subscription;

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService, 
              private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.systemConstantUtils.loadInitialData().subscribe();
    this.loadHeadersAndColumns();
    this.userSystemConstantPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.systemConstantsColumns);
    this.langConstantsSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadHeadersAndColumns();
      this.userSystemConstantPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.systemConstantsColumns);
    });
  }

  onUserSystemConstantPreferencesChanges(userSystemConstantPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userSystemConstantPreferences));
  }

  loadHeadersAndColumns() {
    this.systemConstantsColumns = this.loadColumnSystemConstantHeaders();;
  }

  loadColumnSystemConstantHeaders(): any[] {
    return  [
      {
        field: 'name',
        minWidth: 110,
        header: this.translate.instant(_('SYSTEM_CONSTANT.TABLE_SYSTEM_CONSTANT.CONSTANT'))
      },
      {
        field: 'value',
        minWidth: 110,
        header: this.translate.instant(_('SYSTEM_CONSTANT.TABLE_SYSTEM_CONSTANT.VALUE'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langConstantsSubscription) {
      this.langConstantsSubscription.unsubscribe();
    }
  }
}
