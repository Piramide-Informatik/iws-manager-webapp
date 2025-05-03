import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';

@Component({
  selector: 'app-iws-commissions-table',
  standalone: false,
  templateUrl: './iws-commissions-table.component.html',
  styles: ``,
})
export class IwsCommissionsTableComponent implements OnInit, OnDestroy {
  commissions: any[] = [];
  columnsHeaderFieldCommissions: any[] = [];
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {
    this.commissions = [
      { id: 1, threshold: 0, percentage: 12.0, minCommission: 0 },
      { id: 2, threshold: 50000, percentage: 10.0, minCommission: 6000 },
      { id: 3, threshold: 1000000, percentage: 8.0, minCommission: 10000 },
    ];

    this.loadColHeadersCommissions();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersCommissions();
      this.routerUtils.reloadComponent(true);
    });
  }

  loadColHeadersCommissions(): void {
    this.columnsHeaderFieldCommissions = [
      {
        field: 'threshold',
        styles: { width: '120px' },
        header: this.translate.instant(_('IWS_COMMISSIONS.TABLE.THRESHOLD')),
      },
      {
        field: 'percentage',
        styles: { width: '120px' },
        header: this.translate.instant(_('IWS_COMMISSIONS.TABLE.PERCENTAGE')),
      },
      {
        field: 'minCommission',
        styles: { width: '120px' },
        header: this.translate.instant(
          _('IWS_COMMISSIONS.TABLE.MIN_COMMISSION')
        ),
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
