import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dunning-levels',
  standalone: false,
  templateUrl: './dunning-levels.component.html',
  styleUrl: './dunning-levels.component.scss'
})
export class DunningLevelsComponent implements OnInit, OnDestroy {
  dunningLevels: any[] = [];
  columsHeaderField: any[] = [];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly router: Router
  ){}

  ngOnInit(): void {
    this.dunningLevels = this.masterDataService.getDunningLevelsData();

    this.loadColHeaders();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.columsHeaderField = [
      { field: 'dunningLevel', styles: {'width': '100px'}, header: this.translate.instant(_('DUNNING_LEVELS.LABEL.DUNNING_LEVEL')) },
      { field: 'text', styles: {'width': 'auto'},  header: this.translate.instant(_('DUNNING_LEVELS.LABEL.TEXT')) },
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
