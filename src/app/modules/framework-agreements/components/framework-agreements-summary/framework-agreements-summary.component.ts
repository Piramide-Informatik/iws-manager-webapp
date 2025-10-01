import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { FrameworkAgreementsUtils } from '../../utils/framework-agreement.util';
import { Column } from '../../../../Entities/column';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';
import { Title } from '@angular/platform-browser';
import { CustomerStateService } from '../../../customer/utils/customer-state.service';

@Component({
  selector: 'app-framework-agreements-summary',
  standalone: false,
  templateUrl: './framework-agreements-summary.component.html',
  styleUrl: './framework-agreements-summary.component.scss'
})
export class FrameworkAgreementsSummaryComponent implements OnInit, OnDestroy {

  private readonly frameworkAgreementUtils = inject(FrameworkAgreementsUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly customerStateService = inject(CustomerStateService);

  public cols!: Column[];
  private langSubscription!: Subscription;
  public frameworkAgreements!: any[];
  public selectedColumns!: Column[];
  public showOCCErrorModalBasicContract = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  customer!: any;
  userFrameworkAgreementsPreferences: UserPreference = {};
  tableKey: string = 'FrameworkAgreements'
  dataKeys = ['contractno', 'frameworkContract', 'date', 'fundingProgram', 'contractStatus', 'iwsEmployee'];

  @ViewChild('dt2') dt2!: Table;
  visibleFrameworkAgreementModal = false;
  isFrameworkAgreementLoading = false;
  selectedFrameworkAgreement: any = undefined;
  modalFrameworkAgreementType: any = 'create';

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
    this.route.params.subscribe(params => {
      this.frameworkAgreementUtils.getAllFrameworkAgreementsByCustomerIdSortedByContractNo(params['id']).subscribe(fas => {
        const customerId = params['id'];
        if (!customerId) {
          this.updateTitle('...');
          return;
        }
        this.customerStateService.currentCustomer$.pipe(take(1)).subscribe(currentCustomer => {
          if (currentCustomer) {
            this.updateTitle(currentCustomer.customername1!);
          } else {
            this.getTitleByCustomerId(customerId);
          }
        })

        this.frameworkAgreements = fas.reduce((acc: any[], curr) => {
          acc.push({
            id: curr.id,
            contractLabel: curr.contractLabel,
            contractno: curr.contractNo,
            frameworkContract: curr.contractLabel,
            date: curr.date,
            fundingProgram: curr.fundingProgram?.name,
            contractStatus: curr.contractStatus?.status,
            iwsEmployee: curr.employeeIws?.employeeLabel
          });
          return acc
        }, [])
      });
    })

  }

  private getTitleByCustomerId(customerId: any): void {
    this.customerUtils.getCustomerById(customerId).subscribe(customer => {
      if (customer) {
        this.updateTitle(customer.customername1!);
        this.customer = customer;
      } else {
        this.updateTitle('');
      }
    });
  }

  private updateTitle(name: string): void {
    this.titleService.setTitle(`${this.translate.instant('PAGETITLE.CUSTOMER')} ${name}`);
  }

  loadFrameworkAgreementsColHeaders(): void {
    this.cols = [
      {
        field: 'contractno',
        customClasses: ['align-right', 'date-font-style'],
        classesTHead: ['fix-width'],
        routerLink: (row: any) => `./framework-agreement-details/${row.id}`,
        header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_NUMBER'))
      },
      { field: 'frameworkContract', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_LABEL')) },
      { field: 'date', type: 'date', customClasses: ['text-center'], header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.DATE')) },
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
    this.modalFrameworkAgreementType = 'delete';
    this.selectedFrameworkAgreement = this.frameworkAgreements.find(fa => fa.id == id);
    this.visibleFrameworkAgreementModal = true;
  }

  onFrameworkAgreementDeleteConfirm() {
    this.isFrameworkAgreementLoading = true;
    if (this.selectedFrameworkAgreement) {
      this.frameworkAgreementUtils.deleteFrameworkAgreement(this.selectedFrameworkAgreement.id).subscribe({
        next: () => {
          this.frameworkAgreements = this.frameworkAgreements.filter(fa => fa.id != this.selectedFrameworkAgreement.id);
          this.commonMessageService.showDeleteSucessfullMessage()
        },
        error: (error) => {
          if (error.message.includes('have associated orders')) {
            this.commonMessageService.showErrorDeleteMessageContainsOtherEntities();
          } else {
            this.commonMessageService.showErrorDeleteMessage();
          }
          this.handleFinishRequest();
        },
        complete: () => {
          this.handleFinishRequest();
        }
      })
    }
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message?.includes('404')) {
      this.showOCCErrorModalBasicContract = true;
      this.occErrorType = 'DELETE_UNEXISTED';
      this.visibleFrameworkAgreementModal = false;
    }
  }

  handleFinishRequest() {
    this.selectedFrameworkAgreement = undefined;
    this.visibleFrameworkAgreementModal = false;
    this.isFrameworkAgreementLoading = false;
  }

  createFrameworkAgreementDetail() {
    this.modalFrameworkAgreementType = 'create';
    this.visibleFrameworkAgreementModal = true;
  }

  onCreateFrameworkAgreement(data: any) {
    this.isFrameworkAgreementLoading = true;
    this.frameworkAgreementUtils.createNewFrameworkAgreement(data).subscribe({
      next: (createdContract) => {
        this.commonMessageService.showCreatedSuccesfullMessage();
        setTimeout(() => {
          this.visibleFrameworkAgreementModal = false;
          this.navigationToEdit(createdContract.id);
        }, 2000)
      },
      error: (error) => {
        console.log(error);
        this.commonMessageService.showErrorCreatedMessage();
        this.isFrameworkAgreementLoading = false;
      }
    });
  }

  private navigationToEdit(id: number): void {
    this.router.navigate(['./framework-agreement-details', id], { relativeTo: this.route });
  }

  onDeleteFrameworkAgreement(data: any) {
    console.log(data);
    this.frameworkAgreementUtils.deleteFrameworkAgreement(data.id).subscribe({
      next: () => {
        this.frameworkAgreements = this.frameworkAgreements.filter(fa => fa.id != data.id);
        this.commonMessageService.showDeleteSucessfullMessage()
        this.visibleFrameworkAgreementModal = false;
      },
      error: (error) => {
        this.handleDeleteError(error);

        if (error.message.includes('have associated orders')) {
          this.commonMessageService.showErrorDeleteMessageContainsOtherEntities();
        } else {
          this.commonMessageService.showErrorDeleteMessage();
        }
        this.handleFinishRequest();
      },
      complete: () => {
        this.handleFinishRequest();
      }
    })
  }

  onModalVisible(value: boolean) {
    this.visibleFrameworkAgreementModal = value;
  }

  onModalHide() {
    this.modalFrameworkAgreementType = '';
  }
}