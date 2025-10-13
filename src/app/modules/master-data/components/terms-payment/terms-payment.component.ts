import { Component, computed, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { PayCondition } from '../../../../Entities/payCondition';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { PayConditionUtils } from './utils/pay-condition-utils';
import { PayConditionService } from '../../../../Services/pay-condition.service';
import { PayConditionStateService } from './utils/pay-condition-state.services';
import { PageTitleService } from '../../../../shared/services/page-title.service';
import { ModalTermsPaymentComponent } from './components/modal-terms-payment/modal-terms-payment.component';

@Component({
  selector: 'app-terms-payment',
  standalone: false,
  templateUrl: './terms-payment.component.html',
  styles: ``
})
export class TermsPaymentComponent implements OnInit, OnDestroy {
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly payConditionUtils = inject(PayConditionUtils);
  private readonly payConditionService = inject(PayConditionService);
  private readonly payStateService = inject(PayConditionStateService);
  public columsHeaderFieldTermsPayment: any[] = [];
  userTermsPaymentPreferences: UserPreference = {};
  tableKey: string = 'TermsPayment'
  dataKeys = ['name', 'deadline'];
  private langSubscription!: Subscription;
  public modalType: 'create' | 'delete' = 'create';
  public isVisibleModal: boolean = false;
  termPayment!: PayCondition;
  readonly termsPayment = computed(() => {
    return this.payConditionService.payConditions();
  });

  @ViewChild('termsPaymentModal') dialog!: ModalTermsPaymentComponent;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
  private readonly pageTitleService: PageTitleService,
  ){}

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.TERMS_OF_PAYMENT');
    this.payConditionUtils.loadInitialData().subscribe()

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
      { field: 'name', styles: {'width': 'auto'}, header: this.translate.instant(_('TERMS_OF_PAYMENT.TERMS_OF_PAYMENT')) },
      { field: 'deadline', styles: {'width': 'auto'}, header: this.translate.instant(_('TERMS_OF_PAYMENT.TERM_OF_PAYMENT')), customClasses: ['align-right'] },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete') {
      const termPay = this.termsPayment().find(tp => tp.id == event.data);
      if (termPay) {
        this.termPayment = termPay;
      }
    }
    this.isVisibleModal = true;
  }

  createPayCondition(event: { created?: PayCondition, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  deletePayCondition(event: {status: 'success' | 'error', error?: Error}) {
    if(event.status === 'success'){
      this.payStateService.clearPayCondition();
      this.commonMessageService.showDeleteSucessfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorDeleteMessage();
    }
  }

  editPayCondition(payCondition: PayCondition): void {
    this.payStateService.setPayConditionToEdit(payCondition);
  }

  onModalTermsPaymentClose() {
    if (this.dialog) {
      this.dialog.closeModal();
    }
  }
}
