import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';

@Component({
  selector: 'app-dunning-levels',
  standalone: false,
  templateUrl: './dunning-levels.component.html',
  styles: []
})
export class DunningLevelsComponent implements OnInit, OnDestroy {
  dunningLevels: any[] = [];
  columsHeaderField: any[] = [];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.dunningLevels = this.masterDataService.getDunningLevelsData();

    this.loadColHeaders();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.routerUtils.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.columsHeaderField = [
      { field: 'dunningLevel', styles: {'width': '100px'}, header: this.translate.instant(_('DUNNING_LEVELS.LABEL.DUNNING_LEVEL')) },
      { field: 'text', styles: {'width': 'auto'},  header: this.translate.instant(_('DUNNING_LEVELS.LABEL.TEXT')) },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
