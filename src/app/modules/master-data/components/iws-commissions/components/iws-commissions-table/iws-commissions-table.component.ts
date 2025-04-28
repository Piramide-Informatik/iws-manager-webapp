import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-iws-commissions-table',
  standalone: false,
  templateUrl: './iws-commissions-table.component.html',
  styleUrl: './iws-commissions-table.component.scss',
})
export class IwsCommissionsTableComponent implements OnInit, OnDestroy {
  commissions: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.commissions = [
      { id: 1, threshold: 0, percentage: 12.0, minCommission: 0 },
      { id: 2, threshold: 50000, percentage: 10.0, minCommission: 6000 },
      { id: 3, threshold: 1000000, percentage: 8.0, minCommission: 10000 },
    ];

    this.loadColHeaders();
    this.selectedColumns = [...this.cols];

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.selectedColumns = [...this.cols];
    });
  }

  loadColHeaders(): void {
    this.cols = [
      {
        field: 'threshold',
        minWidth: 110,
        header: this.translate.instant(_('IWS_COMMISSIONS.TABLE.THRESHOLD')),
      },
      {
        field: 'percentage',
        minWidth: 110,
        header: this.translate.instant(_('IWS_COMMISSIONS.TABLE.PERCENTAGE')),
      },
      {
        field: 'minCommission',
        minWidth: 110,
        header: this.translate.instant(
          _('IWS_COMMISSIONS.TABLE.MIN_COMMISSION')
        ),
      },
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {});
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  editCommission(commission: any) {
    console.log('Editing', commission);
  }

  deleteCommission(id: number) {
    console.log('Deleting ID', id);
  }

  createCommission() {
    console.log('Creating new commission');
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}
