import { Component } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

@Component({
  selector: 'app-billers',
  standalone: false,
  templateUrl: './billers.component.html',
  styles: ``
})
export class BillersComponent {
  public billers: any[] = [];
  public columsHeaderFieldBillers: any[] = [];
  userPreferences: UserPreference = {};
  tableKey: string = 'Billers'
  dataKeys = ['biller'];

  
  private langSubscription!: Subscription;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.billers = this.masterDataService.getBillersData();

    this.loadColHeadersBillers();
    this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldBillers);
 
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersBillers();
      this.routerUtils.reloadComponent(true);
      this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldBillers);
    });
  }

  onUserPreferencesChanges(userPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }

  loadColHeadersBillers(): void {
    this.columsHeaderFieldBillers = [
      { field: 'biller', styles: {'width': 'auto'}, header: this.translate.instant(_('SIDEBAR.BILLERS')) },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
