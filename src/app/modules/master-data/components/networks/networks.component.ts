import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { RouterUtilsService } from '../../router-utils.service';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { NetowrkUtils } from './utils/ network.utils';
import { NetworkService } from '../../../../Services/network.service';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { Network } from '../../../../Entities/network';
import { NetworkStateService } from './utils/network-state.service';

@Component({
  selector: 'app-networks',
  standalone: false,
  templateUrl: './networks.component.html',
  styles: ``
})
export class NetworksComponent implements OnInit, OnDestroy {
  private readonly networkUtils = inject(NetowrkUtils);
  private readonly networkService = inject(NetworkService);
  private readonly networkStateService = inject(NetworkStateService);
  public columsHeaderFieldNetworks: any[] = [];
  userNetworksPreferences: UserPreference = {};
  tableKey: string = 'Networks'
  dataKeys = ['name'];

  private langSubscription!: Subscription;

  readonly networks = computed(() => {
    return this.networkService.networks();
  });
  visibleNetworksModal = false;
  modalType: 'create' | 'delete' = 'create';
  selectedNetwork!: Network;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly commonMessageService: CommonMessagesService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.networkUtils.loadInitialData().subscribe();
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
      { field: 'name', styles: {'width': 'auto'}, header: this.translate.instant(_('NETWORKS.LABEL.NETWORK')) },
    ];
  }
  
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete') {
      const foundNetwork = this.networks().find(nt => nt.id == event.data);
      if (foundNetwork) {
        this.selectedNetwork = foundNetwork;
      }
    }
    this.visibleNetworksModal = true;
  }

  onModalVisibilityChange(isVisible: boolean) {
    this.visibleNetworksModal = isVisible;
  }

  onDeleteNetwork(event: {status: 'success' | 'error', error?: Error}) {
    if(event.status === 'success'){
      this.commonMessageService.showDeleteSucessfullMessage();
    }else if(event.status === 'error'){
      event.error?.message === 'Cannot delete register: it is in use by other entities' ?
        this.commonMessageService.showErrorDeleteMessageUsedByOtherEntities() :
        this.commonMessageService.showErrorDeleteMessage();
    }
  }

  onCreateNetwork(event: { created?: Network, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onEditNetwork(network: Network): void {
    this.networkStateService.setNetworkToEdit(network);
  }
}
