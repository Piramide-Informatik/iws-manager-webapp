import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-masterdata-panel',
  standalone: true,
  imports: [CommonModule, RouterModule, TooltipModule, TranslateModule],
  templateUrl: './masterdata-panel.component.html',
  styleUrls: ['./masterdata-panel.component.scss'],
})
export class MasterdataPanelComponent implements OnInit, OnDestroy {
  masterDataGroups: any[] = [];
  activeItems: any[] = [];
  private langSubscription!: Subscription;
  private readonly groupedItems = [
      {
        label: 'PEOPLE',
        children: [
          { key: 'USER', path: 'user' },
          { key: 'ROLES', path: 'roles' },
          { key: 'IWS_STAFF', path: 'iws-staff' },
          { key: 'IWS_COMMISSIONS', path: 'iws-commissions' },
          { key: 'IWS_TEAMS', path: 'iws-teams' },
          { key: 'EMPLOYEE_QUALIFICATION', path: 'employee-qualification' },
        ],
      },
      {
        label: 'LOCATION',
        children: [
          { key: 'ADDRESS', path: 'address' },
          { key: 'COUNTRIES', path: 'countries' },
          { key: 'TITLE', path: 'title' },
        ],
      },
      {
        label: 'PROJECTS',
        children: [
          { key: 'PROJECT_STATUS', path: 'project-status' },
          { key: 'PROJECT_FUNNELS', path: 'project-funnels' },
          {
            key: 'REALIZATION_PROBABILITIES',
            path: 'realization-probabilities',
          },
        ],
      },
      {
        label: 'FINANCE',
        children: [
          { key: 'FUNDING_PROGRAMS', path: 'funding-programs' },
          { key: 'COST', path: 'cost' },
          { key: 'BILLERS', path: 'billers' },
          { key: 'SALES_TAX', path: 'sales-tax' },
          { key: 'DUNNING_LEVELS', path: 'dunning-levels' },
          { key: 'BILLING_METHODS', path: 'billing-methods' },
          { key: 'TERMS_OF_PAYMENT', path: 'terms-payment' },
          { key: 'CONTRACT_STATUS', path: 'contract-status' },
        ],
      },
      {
        label: 'CONFIGURATION',
        children: [
          { key: 'SYSTEM_CONSTANTS', path: 'system-constants' },
          { key: 'TEXTS', path: 'texts' },
          { key: 'TYPES_OF_COMPANIES', path: 'type-companies' },
        ],
      },
      {
        label: 'OPERATIONS',
        children: [
          { key: 'ORDER_TYPES', path: 'order-types' },
          { key: 'APPROVAL_STATUS', path: 'approval-status' },
          { key: 'ABSENCE_TYPES', path: 'absence-types' },
          { key: 'HOLIDAYS', path: 'holidays' },
          { key: 'STATES', path: 'states' },
          { key: 'NETWORKS', path: 'networks' },
        ],
      },
    ];

  constructor(private readonly translate: TranslateService) {}

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

  selectedGroupLabel: string = '';

  onGroupClick(group: any): void {
    this.selectedGroupLabel = group.label;
    this.activeItems = group.items;
  }

  private getMasterDataSidebar(): any[] {

    return this.groupedItems.map((group) => ({
      label: this.translate.instant(`SIDEBAR.${group.label}`),
      rawLabel: group.label,
      items: group.children.map((item) => ({
        label: this.translate.instant(`SIDEBAR.${item.key}`),
        routerLink: [`/master-data/${item.path}`],
      })),
    }));
  }
}
