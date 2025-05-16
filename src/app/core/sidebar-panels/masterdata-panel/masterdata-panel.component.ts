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
    return [];
  }
}
