import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { FrameworkAgreements } from '../../../../Entities/Framework-agreements';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { FrameworkAgreementsUtils } from '../../utils/framework-agreement.service';
import { CommonMessagesService } from '../../../../Services/common-messages.service';

interface Column {
  field: string,
  header: string,
  customClasses?: string[],
  routerLink?: (row: any) => string
}

@Component({
  selector: 'app-framework-agreements-summary',
  standalone: false,
  templateUrl: './framework-agreements-summary.component.html',
  styleUrl: './framework-agreements-summary.component.scss'
})
export class FrameworkAgreementsSummaryComponent implements OnInit, OnDestroy {

  private readonly frameworkAgreementUtils = inject(FrameworkAgreementsUtils);
  private readonly translate = inject(TranslateService); 
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  public cols!: Column[];
  private langSubscription!: Subscription;
  public frameworkAgreements!: FrameworkAgreements[];
  public selectedColumns!: Column[];
  userFrameworkAgreementsPreferences: UserPreference = {};
  tableKey: string = 'FrameworkAgreements'
  dataKeys = ['id', 'frameworkContract', 'date', 'fundingProgram', 'contractStatus', 'iwsEmployee'];
  
  @ViewChild('dt2') dt2!: Table;
  visibleFrameworkAgreementModal = false;
  selectedFrameworkAgreement: any = undefined;

  constructor(private readonly commonMessageService: CommonMessagesService) { }

  ngOnInit(): void {
    this.loadFrameworkAgreementsColHeaders();
    this.frameworkAgreements = [];
    this.selectedColumns = this.cols;
    this.userFrameworkAgreementsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadFrameworkAgreementsColHeaders();
      this.reloadComponent(true);
      this.userFrameworkAgreementsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  loadFrameworkAgreementsColHeaders(): void {
    this.cols = [
      { 
        field: 'id', 
        customClasses: ['align-right'], 
        routerLink: (row: any) => `./framework-agreement-details/${row.id}`,
        header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_NUMBER')) },
      { field: 'frameworkContract', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_LABEL')) },
      { field: 'date', customClasses: ['text-center'], header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.DATE')) },
      { field: 'fundingProgram', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.FUNDING_PROGRAM')) },
      { field: 'contractStatus', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_STATUS')) },
      { field: 'iwsEmployee', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.IWS_EMPLOYEE')) }
    ];
  }

  onUserFrameworkAgreementsPreferencesChanges(userFrameworkAgreementsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userFrameworkAgreementsPreferences));
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  goToFrameworkAgreementDetail(frameworkAgreement: any) {
    this.router.navigate(['framework-agreement-details', frameworkAgreement.id], { 
      relativeTo: this.route
    });
  }

  deleteFrameworkAgreement(id: number) {
    this.selectedFrameworkAgreement = this.frameworkAgreements.find(fa => fa.id == id);
    this.visibleFrameworkAgreementModal = true;
  }

  onFrameworkAgreementDeleteConfirm() {
    if (this.selectedFrameworkAgreement) {
      this.frameworkAgreementUtils.deleteFrameworkAgreement(this.selectedFrameworkAgreement.id).subscribe({
        next: () => {
          this.frameworkAgreements = this.frameworkAgreements.filter( fa => fa.id != this.selectedFrameworkAgreement.id);
          this.commonMessageService.showDeleteSucessfullMessage()
        },
        error: () => {
          this.commonMessageService.showErrorDeleteMessage();
        },
        complete: () => {
          this.selectedFrameworkAgreement = undefined;
          this.visibleFrameworkAgreementModal = false;
        }
      })
    }
  }

  createFrameworkAgreementDetail() {
    this.router.navigate(['framework-agreement-details'], { 
      relativeTo: this.route
    });
  }
}