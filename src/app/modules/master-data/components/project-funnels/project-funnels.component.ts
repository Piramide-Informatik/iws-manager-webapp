import { Component, inject, computed, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { PromoterUtils } from './utils/promoter-utils';
import { PromoterService } from '../../../../Services/promoter.service';
import { Promoter } from '../../../../Entities/promoter';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { PromoterStateService } from './utils/promoter-state.service';
import { Column } from '../../../../Entities/column';
import { PageTitleService } from '../../../../shared/services/page-title.service';
import { ModalProjectFunnelComponent } from './components/modal-project-funnel/modal-project-funnel.component';

@Component({
  selector: 'app-project-funnels',
  standalone: false,
  templateUrl: './project-funnels.component.html',
  styles: ``
})
export class ProjectFunnelsComponent implements OnInit, OnDestroy {
  private readonly promoterUtils = inject(PromoterUtils);
  private readonly promoterService = inject(PromoterService);
  private readonly promoterStateService = inject(PromoterStateService);
  columsHeaderFieldProjecFunnels: Column[] = [];
  userProjectFunnelsPreferences: UserPreference = {};
  tableKey: string = 'ProjectFunnels'
  dataKeys = ['id','projectPromoter'];
  selectedProjectFunnels!: Promoter;
  private readonly commonMessageService = inject(CommonMessagesService);
  public modalType: 'create' | 'delete' = 'create';
  public isVisibleModal: boolean = false;

  private langSubscription!: Subscription;
  readonly projectFunnels = computed(() => {
    return this.promoterService.promoters();
  });
  @ViewChild('projectFunnelsModal') dialog!: ModalProjectFunnelComponent;
  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly pageTitleService: PageTitleService
  ){}

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.PROJECT_FUNNELS');
    this.promoterUtils.loadInitialData().subscribe();
    this.loadColHeadersProjectFunnels();
    this.userProjectFunnelsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProjecFunnels);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersProjectFunnels();
      this.routerUtils.reloadComponent(true);
      this.userProjectFunnelsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProjecFunnels);
    });
  }

  onUserProjectFunnelsPreferencesChanges(userProjectFunnelsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userProjectFunnelsPreferences));
  }

  loadColHeadersProjectFunnels(): void {
    this.columsHeaderFieldProjecFunnels = [
      { field: 'promoterNo', classesTHead: ['width-10'],header: 'Nr', useSameAsEdit: true},
      { field: 'projectPromoter',  header: this.translate.instant(_('PROJECT_FUNNELS.TABLE.PROJECT_SPONSOR')) },
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
      const promoterFound =  this.projectFunnels().find( pf => pf.id == event.data);
      if (promoterFound) {
        this.selectedProjectFunnels = promoterFound;
      }
    }
    this.isVisibleModal = true;
  }

  onCreatePromoter(event: { created?: Promoter, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onDeletePromoter(event: {status: 'success' | 'error', error?: Error}): void {
    if(event.status === 'success'){
      this.promoterStateService.clearPromoter();
      this.commonMessageService.showDeleteSucessfullMessage();
    } else if(event.status === 'error') {
      this.commonMessageService.showErrorDeleteMessage();
    }
  }

  onEditPromoter(promoter: Promoter): void {
    this.promoterStateService.setPromoterToEdit(promoter);
  }

  onModalProjectFunnelsClose() {
    if (this.dialog) {
      this.dialog.closeModal();
    }
  }
}
