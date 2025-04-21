import { ViewChild, ElementRef } from '@angular/core';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-masterdata-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TooltipModule],
  templateUrl: './masterdata-panel.component.html',
  styleUrls: ['./masterdata-panel.component.scss'],
})
export class MasterdataPanelComponent implements OnInit, OnDestroy {
  masterDataGroups: any[] = [];
  private langSubscription!: Subscription;

  constructor(private readonly translate: TranslateService) {}
  @ViewChild('scrollMenu') scrollMenu!: ElementRef;

  scroll(direction: 'left' | 'right') {
    const container = this.scrollMenu.nativeElement as HTMLElement;
    const scrollAmount = 200;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  }

  ngOnInit(): void {
    this.masterDataGroups = this.getMasterDataSidebar();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.masterDataGroups = this.getMasterDataSidebar();
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
  private getMasterDataSidebar(): any[] {
    return [
      {
        label: this.translate.instant('SIDEBAR.USER'),
        routerLink: ['/master-data/user'],
      },
      {
        label: this.translate.instant('SIDEBAR.ROLES'),
        routerLink: ['/master-data/roles'],
      },
      {
        label: this.translate.instant('SIDEBAR.IWS_STAFF'),
        routerLink: ['/master-data/iws-staff'],
      },
      {
        label: this.translate.instant('SIDEBAR.IWS_COMMISSIONS'),
        routerLink: ['/master-data/iws-commissions'],
      },
      {
        label: this.translate.instant('SIDEBAR.IWS_TEAMS'),
        routerLink: ['/master-data/iws-teams'],
      },
      {
        label: this.translate.instant('SIDEBAR.COUNTRIES'),
        routerLink: ['/master-data/countries'],
      },
      {
        label: this.translate.instant('SIDEBAR.STATES'),
        routerLink: ['/master-data/states'],
      },
      {
        label: this.translate.instant('SIDEBAR.TITLE'),
        routerLink: ['/master-data/title'],
      },
      {
        label: this.translate.instant('SIDEBAR.ORDER_TYPES'),
        routerLink: ['/master-data/order-types'],
      },
      {
        label: this.translate.instant('SIDEBAR.APPROVAL_STATUS'),
        routerLink: ['/master-data/approval-status'],
      },
      {
        label: this.translate.instant('SIDEBAR.HOLIDAYS'),
        routerLink: ['/master-data/holidays'],
      },
      {
        label: this.translate.instant('SIDEBAR.ABSENCE_TYPES'),
        routerLink: ['/master-data/absence-types'],
      },
      {
        label: this.translate.instant('SIDEBAR.FUNDING_PROGRAMS'),
        routerLink: ['/master-data/funding-programs'],
      },
      {
        label: this.translate.instant('SIDEBAR.PROJECT_STATUS'),
        routerLink: ['/master-data/project-status'],
      },
      {
        label: this.translate.instant('SIDEBAR.PROJECT_FUNNELS'),
        routerLink: ['/master-data/project-funnels'],
      },
      {
        label: this.translate.instant('SIDEBAR.REALIZATION_PROBABILITIES'),
        routerLink: ['/master-data/realization-probabilities'],
      },
      {
        label: this.translate.instant('SIDEBAR.BILLERS'),
        routerLink: ['/master-data/billers'],
      },
      {
        label: this.translate.instant('SIDEBAR.DUNNING_LEVELS'),
        routerLink: ['/master-data/dunning-levels'],
      },
      {
        label: this.translate.instant('SIDEBAR.SALES_TAX'),
        routerLink: ['/master-data/sales-tax'],
      },
      {
        label: this.translate.instant('SIDEBAR.BILLING_METHODS'),
        routerLink: ['/master-data/billing-methods'],
      },
      {
        label: this.translate.instant('SIDEBAR.CONTRACT_STATUS'),
        routerLink: ['/master-data/contract-status'],
      },
      {
        label: this.translate.instant('SIDEBAR.TERMS_OF_PAYMENT'),
        routerLink: ['/master-data/terms-of-payment'],
      },
      {
        label: this.translate.instant('SIDEBAR.EMPLOYEE_QUALIFICATION'),
        routerLink: ['/master-data/employee-qualification'],
      },
      {
        label: this.translate.instant('SIDEBAR.NETWORKS'),
        routerLink: ['/master-data/networks'],
      },
      {
        label: this.translate.instant('SIDEBAR.SYSTEM_CONSTANTS'),
        routerLink: ['/master-data/system-constants'],
      },
      {
        label: this.translate.instant('SIDEBAR.TEXTS'),
        routerLink: ['/master-data/texts'],
      },
    ];
  }
}
