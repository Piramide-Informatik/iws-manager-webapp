import { Component } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';

@Component({
  selector: 'app-billers',
  standalone: false,
  templateUrl: './billers.component.html',
  styles: ``
})
export class BillersComponent {
  public billers: any[] = [];
  public columsHeaderFieldBillers: any[] = [];
  
  private langSubscription!: Subscription;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.billers = this.masterDataService.getBillersData();

    this.loadColHeadersBillers();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersBillers();
      this.routerUtils.reloadComponent(true);
    });
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
