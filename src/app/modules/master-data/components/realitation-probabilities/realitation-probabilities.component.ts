import { Component } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';

@Component({
  selector: 'app-realitation-probabilities',
  standalone: false,
  templateUrl: './realitation-probabilities.component.html',
  styles: ``
})
export class RealitationProbabilitiesComponent {
  public probabilities: any[] = [];
  public columsHeaderFieldProbabilities: any[] = [];

  private langSubscription!: Subscription;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.probabilities = this.masterDataService.getRealizationProbabilitiesData();

    this.loadColHeadersProbabilities();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersProbabilities();
      this.routerUtils.reloadComponent(true);
    });
  }
  
  loadColHeadersProbabilities(): void {
    this.columsHeaderFieldProbabilities = [
      { field: 'realizationProbabilities', styles: {'width': 'auto'}, header: this.translate.instant(_('SIDEBAR.REALIZATION_PROBABILITIES')) },
    ];
  }
  
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
