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
    { key: 'ABSENCE_TYPES', path: 'absence-types' },
    { key: 'TITLE', path: 'title' },
    { key: 'ORDER_TYPES', path: 'order-types' },
    { key: 'USER', path: 'user' },
    { key: 'ROLES', path: 'roles' },
    { key: 'APPROVAL_STATUS', path: 'approval-status' },
    { key: 'STATES', path: 'states' },
    { key: 'HOLIDAYS', path: 'holidays' },
    { key: 'FUNDING_PROGRAMS', path: 'funding-programs' },
    { key: 'IWS_STAFF', path: 'iws-staff' },
    { key: 'IWS_COMMISSIONS', path: 'iws-commissions' },
    { key: 'IWS_TEAMS', path: 'iws-teams' },
    { key: 'COUNTRIES', path: 'countries' },
    { key: 'DUNNING_LEVELS', path: 'dunning-levels' },
    { key: 'EMPLOYEE_QUALIFICATION', path: 'employee-qualification' },
    { key: 'NETWORKS', path: 'networks' },
    { key: 'PROJECT_STATUS', path: 'project-status' },
    { key: 'PROJECT_FUNNELS', path: 'project-funnels' },
    { key: 'REALIZATION_PROBABILITIES', path: 'realization-probabilities' },
    { key: 'BILLERS', path: 'billers' },
    { key: 'SYSTEM_CONSTANTS', path: 'system-constants' },
    { key: 'TEXTS', path: 'texts' },
  ];

  private getMasterDataSidebar(): any[] {
    return this.items.map((item) => ({
      label: this.translate.instant(`SIDEBAR.${item.key}`),
      routerLink: [`/master-data/${item.path}`],
    }));
  }
}
