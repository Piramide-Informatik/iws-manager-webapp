import {
  ViewChild,
  ElementRef,
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
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
  private readonly items: { key: string; path: string }[] = [
    { key: 'SIDEBAR.USER', path: 'user' },
    { key: 'SIDEBAR.ROLES', path: 'roles' },
    { key: 'SIDEBAR.IWS_STAFF', path: 'iws-staff' },
    { key: 'SIDEBAR.IWS_COMMISSIONS', path: 'iws-commissions' },
    { key: 'SIDEBAR.IWS_TEAMS', path: 'iws-teams' },
    { key: 'SIDEBAR.COUNTRIES', path: 'countries' },
    { key: 'SIDEBAR.STATES', path: 'states' },
    { key: 'SIDEBAR.TITLE', path: 'title' },
    { key: 'SIDEBAR.ORDER_TYPES', path: 'order-types' },
    { key: 'SIDEBAR.APPROVAL_STATUS', path: 'approval-status' },
    { key: 'SIDEBAR.HOLIDAYS', path: 'holidays' },
    { key: 'SIDEBAR.ABSENCE_TYPES', path: 'absence-types' },
    { key: 'SIDEBAR.FUNDING_PROGRAMS', path: 'funding-programs' },
    { key: 'SIDEBAR.PROJECT_STATUS', path: 'project-status' },
    { key: 'SIDEBAR.PROJECT_FUNNELS', path: 'project-funnels' },
    {
      key: 'SIDEBAR.REALIZATION_PROBABILITIES',
      path: 'realization-probabilities',
    },
    { key: 'SIDEBAR.BILLERS', path: 'billers' },
    { key: 'SIDEBAR.DUNNING_LEVELS', path: 'dunning-levels' },
    { key: 'SIDEBAR.SALES_TAX', path: 'sales-tax' },
    { key: 'SIDEBAR.BILLING_METHODS', path: 'billing-methods' },
    { key: 'SIDEBAR.CONTRACT_STATUS', path: 'contract-status' },
    { key: 'SIDEBAR.TERMS_OF_PAYMENT', path: 'terms-of-payment' },
    { key: 'SIDEBAR.EMPLOYEE_QUALIFICATION', path: 'employee-qualification' },
    { key: 'SIDEBAR.NETWORKS', path: 'networks' },
    { key: 'SIDEBAR.SYSTEM_CONSTANTS', path: 'system-constants' },
    { key: 'SIDEBAR.TEXTS', path: 'texts' },
  ];

  private getMasterDataSidebar(): any[] {
    return this.items.map((item) => ({
      label: this.translate.instant(item.key),
      routerLink: [`/master-data/${item.path}`],
    }));
  }
}
