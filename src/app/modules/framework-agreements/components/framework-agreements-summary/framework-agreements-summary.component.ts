import { Component, OnInit, OnDestroy, ViewChild, inject, computed } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { FrameworkAgreementsUtils } from '../../utils/framework-agreement.util';
import { Column } from '../../../../Entities/column';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { OccErrorType } from '../../../shared/utils/occ-error';
import { Title } from '@angular/platform-browser';
import { CustomerStateService } from '../../../customer/utils/customer-state.service';
import { Customer } from '../../../../Entities/customer';
import { FrameworkAgreementService } from '../../../../Services/framework-agreenent.service';
import { BasicContract } from '../../../../Entities/basicContract';

@Component({
  selector: 'app-framework-agreements-summary',
  standalone: false,
  templateUrl: './framework-agreements-summary.component.html',
  styleUrl: './framework-agreements-summary.component.scss'
})
export class FrameworkAgreementsSummaryComponent implements OnInit, OnDestroy {
  private readonly frameworkAgreementService = inject(FrameworkAgreementService);
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
  public selectedColumns!: Column[];
  public showOCCErrorModalBasicContract = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  currentCustomer!: Customer;
  userFrameworkAgreementsPreferences: UserPreference = {};
  tableKey: string = 'FrameworkAgreements'
  dataKeys = ['contractNo', 'contractLabel', 'date', 'fundingProgram', 'contractStatus', 'employeeIws'];
  public frameworkAgreements = computed(() => {
    return this.frameworkAgreementService.frameworkAgreements();
  });

  @ViewChild('dt2') dt2!: Table;
  visibleFrameworkAgreementModal = false;
  selectedFrameworkAgreement: BasicContract | undefined = undefined;
  modalFrameworkAgreementType: 'create' | 'delete' = 'create';
  customerId = '';

  constructor() { }

  ngOnInit(): void {
    this.loadFrameworkAgreementsColHeaders();
    this.selectedColumns = this.cols;
    this.userFrameworkAgreementsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadFrameworkAgreementsColHeaders();
      this.reloadComponent(true);
      this.userFrameworkAgreementsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.customerId = this.route.snapshot.params['id'];
    if (!this.customerId) {
      this.updateTitle('...');
    }

    this.customerStateService.currentCustomer$.pipe(take(1)).subscribe(currentCustomer => {
      if (currentCustomer) {
        this.currentCustomer = currentCustomer;
        this.updateTitle(currentCustomer.customername1!);
      } else {
        this.getTitleByCustomerId(Number(this.customerId));
      }
    })

    this.frameworkAgreementUtils.getAllFrameworkAgreementsByCustomerIdSortedByContractNo(Number(this.customerId)).subscribe();
  }

  private getTitleByCustomerId(customerId: number): void {
    this.customerUtils.getCustomerById(customerId).subscribe(customer => {
      if (customer) {
        this.currentCustomer = customer;
        this.updateTitle(customer.customername1!);
      } else {
        this.updateTitle('');
      }
    });
  }

  private updateTitle(name: string): void {
    this.titleService.setTitle(`${this.translate.instant('PAGETITLE.CUSTOMER')} ${name} ${this.translate.instant('PAGETITLE.CUSTOMERS.BASIC_CONTRACTS')}`);
  }

  loadFrameworkAgreementsColHeaders(): void {
    this.cols = [
      {
        field: 'contractNo',
        customClasses: ['align-right', 'date-font-style'],
        classesTHead: ['fix-width'],
        routerLink: (row: any) => `./framework-agreement-details/${row.id}`,
        header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_NUMBER'))
      },
      { field: 'contractLabel', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_LABEL')) },
      { field: 'date', type: 'date', customClasses: ['text-center'], header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.DATE')) },
      { field: 'fundingProgram.name', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.FUNDING_PROGRAM')) },
      { field: 'contractStatus.status', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.CONTRACT_STATUS')) },
      { field: 'employeeIws.employeeLabel', header: this.translate.instant(_('FRAMEWORK-AGREEMENTS.TABLE.IWS_EMPLOYEE')) }
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
    this.selectedFrameworkAgreement = this.frameworkAgreements().find(fa => fa.id == id);
    this.visibleFrameworkAgreementModal = true;
  }

  createFrameworkAgreementDetail() {
    this.modalFrameworkAgreementType = 'create';
    this.visibleFrameworkAgreementModal = true;
  }

  onModalVisible(value: boolean) {
    this.visibleFrameworkAgreementModal = value;
  }
}