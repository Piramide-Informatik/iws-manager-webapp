import { Component } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

@Component({
  selector: 'app-terms-payment',
  standalone: false,
  templateUrl: './terms-payment.component.html',
  styles: ``
})
export class TermsPaymentComponent {
  public termsPayment: any[] = [];
  public columsHeaderFieldTermsPayment: any[] = [];
  userTermsPaymentPreferences: UserPreference = {};
  tableKey: string = 'TermsPayment'
  dataKeys = ['termsPayment', 'termPayment'];
  private langSubscription!: Subscription;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.termsPayment = this.masterDataService.getTermsPaymentData();

    this.loadColHeadersTermsPayment();
    this.userTermsPaymentPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldTermsPayment);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersTermsPayment();
      this.routerUtils.reloadComponent(true);
      this.userTermsPaymentPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldTermsPayment);
    });
  }

  onUserTermsPaymentPreferencesChanges(userTermsPaymentPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userTermsPaymentPreferences));
  }

  loadColHeadersTermsPayment(): void {
    this.columsHeaderFieldTermsPayment = [
      { field: 'termsPayment', styles: {'width': 'auto'}, header: this.translate.instant(_('TERMS_OF_PAYMENT.TERMS_OF_PAYMENT')) },
      { field: 'termPayment', styles: {'width': 'auto'}, header: this.translate.instant(_('TERMS_OF_PAYMENT.TERM_OF_PAYMENT')), isNumeric: true },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
