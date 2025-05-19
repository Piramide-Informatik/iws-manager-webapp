import { Component, OnDestroy, OnInit } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

@Component({
  selector: 'app-networks',
  standalone: false,
  templateUrl: './networks.component.html',
  styles: ``
})
export class NetworksComponent implements OnInit, OnDestroy {
  public networks: any[] = [];
  public columsHeaderFieldNetworks: any[] = [];
  userNetworksPreferences: UserPreference = {};
  tableKey: string = 'Networks'
  dataKeys = ['network'];

  private langSubscription!: Subscription;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.networks = this.masterDataService.getNetworksData();

    this.loadColHeadersNetworks();
    this.userNetworksPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldNetworks);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersNetworks();
      this.routerUtils.reloadComponent(true);
      this.userNetworksPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldNetworks);
    });
  }

  onUserNetworksPreferencesChanges(userNetworksPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userNetworksPreferences));
  }
  
  loadColHeadersNetworks(): void {
    this.columsHeaderFieldNetworks = [
      { field: 'network', styles: {'width': 'auto'}, header: this.translate.instant(_('NETWORKS.LABEL.NETWORK')) },
    ];
  }
  
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
