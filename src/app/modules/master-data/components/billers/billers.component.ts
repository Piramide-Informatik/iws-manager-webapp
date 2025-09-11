import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { Biller } from '../../../../Entities/biller';
import { CommonMessagesService } from '../../../../Services/common-messages.service';

@Component({
  selector: 'app-billers',
  standalone: false,
  templateUrl: './billers.component.html',
  styles: ``
})
export class BillersComponent implements OnInit, OnDestroy {
  public billers: any[] = [];
  public columsHeaderFieldBillers: any[] = [];
  userBillersPreferences: UserPreference = {};
  tableKey: string = 'Billers'
  dataKeys = ['biller'];
  private readonly commonMessageService = inject(CommonMessagesService);
  public modalType: 'create' | 'delete' = 'create';
  public isVisibleModal: boolean = false;
  
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
    this.userBillersPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldBillers);
 
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersBillers();
      this.routerUtils.reloadComponent(true);
      this.userBillersPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldBillers);
    });
  }

  onUserBillersPreferencesChanges(userBillersPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userBillersPreferences));
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

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    
    this.isVisibleModal = true;
  }

  onCreateBiller(event: { created?: Biller, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }
}
