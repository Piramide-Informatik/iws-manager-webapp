import { 
  Component, 
  computed, 
  inject, 
  OnChanges, 
  OnDestroy, 
  OnInit, 
  SimpleChanges 
} from '@angular/core';
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
import { Column } from '../../../../Entities/column';

@Component({
  selector: 'app-networks',
  standalone: false,
  templateUrl: './networks.component.html',
  styles: ``
})
export class NetworksComponent implements OnInit, OnDestroy, OnChanges {
  private readonly networkUtils = inject(NetowrkUtils);
  private readonly networkService = inject(NetworkService);
  private readonly networkStateService = inject(NetworkStateService);
  private readonly subscriptions = new Subscription();
  public columsHeaderFieldNetworks: Column[] = [];
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
  ) { }

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
      { field: 'name', styles: { 'width': 'auto' }, header: this.translate.instant(_('NETWORKS.LABEL.NETWORK')) },
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

  ngOnChanges(changes: SimpleChanges) {
    if (changes['networks']) {
      this.prepareTableData();
    }
  }

  private prepareTableData() {
    if (this.networks().length > 0) {
      this.columsHeaderFieldNetworks = [
        { field: 'name', header: 'Network' }
      ];
    }
  }

  onDeleteNetwork(event: { status: 'success' | 'error', error?: any }) {
    if (event.status === 'success') {
      this.networkStateService.clearNetwork();
      this.commonMessageService.showDeleteSucessfullMessage();
    } else if (event.status === 'error') {
      const errorMessage = event.error.error.message;
      if (errorMessage.includes('foreign key constraint fails')) {
        this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(errorMessage);
      } else {
        this.commonMessageService.showErrorDeleteMessage();
      }
    }
  }

  onCreateNetwork(event: { created?: Network, status: 'success' | 'error' }): void {
    if (event.created && event.status === 'success') {
      const sub = this.networkService.loadInitialData().subscribe();
      this.subscriptions.add(sub);
      this.prepareTableData();
      this.commonMessageService.showCreatedSuccesfullMessage();
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onEditNetwork(network: Network): void {
    this.networkStateService.setNetworkToEdit(network);
  }
}
