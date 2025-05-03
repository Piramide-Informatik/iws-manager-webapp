import { Component, OnDestroy, OnInit } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-networks',
  standalone: false,
  templateUrl: './networks.component.html',
  styles: ``
})
export class NetworksComponent implements OnInit, OnDestroy {
  public networks: any[] = [];
  public columsHeaderFieldNetworks: any[] = [];

  private langSubscription!: Subscription;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.networks = this.masterDataService.getNetworksData();

    this.loadColHeadersNetworks();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersNetworks();
      this.routerUtils.reloadComponent(true);
    });
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
