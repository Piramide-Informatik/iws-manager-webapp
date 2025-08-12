import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { Contractor } from '../../../../Entities/contractor';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { ContractorUtils } from '../../utils/contractor-utils';
import { Customer } from '../../../../Entities/customer';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { MessageService } from 'primeng/api';

interface Column {
  field: string,
  header: string,
  customClasses?: string[]
}

@Component({
  selector: 'app-contractor-overview',
  standalone: false,
  templateUrl: './contractor-overview.component.html',
  styleUrl: './contractor-overview.component.scss',
  providers: [MessageService]
})
export class ContractorOverviewComponent implements OnInit, OnDestroy {

  public cols!: Column[];
  public contractors!: Contractor[];
  public customer!: Customer | undefined;

  @ViewChild('dt2') dt2!: Table;

  private subscription!: Subscription;

  public selectedColumns!: Column[];

  userContractorOverviewPreferences: UserPreference = {};
  loading: boolean = true;
  tableKey: string = 'ContractorOverview'

  dataKeys = ['label', 'name', 'countryLabel', 'street', 'zipCode', 'city', 'taxNro'];

  modalContractorType: 'create' | 'delete' | 'edit' = 'create';

  visibleModal: boolean = false;

  currentContract!: Contractor;

  private readonly contractorUtils = inject(ContractorUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);


  ngOnInit(): void {
    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.loading = false;

    this.userContractorOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.subscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userContractorOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.route.params.subscribe(params => {
      const customerId = params['id'];

      this.customerUtils.getCustomerById(customerId).subscribe(customer => {
        this.customer = customer;
      });

      this.contractorUtils.getAllContractorsByCustomerId(customerId).subscribe(contractors => {
        this.contractors = contractors;
      });
    });
  }

  loadColHeaders(): void {
    this.cols = [
      {
        field: 'label',
        header: this.translate.instant(_('CONTRACTS.TABLE.CONTRACTOR_LABEL'))
      },
      { field: 'name', header: this.translate.instant(_('CONTRACTS.TABLE.CONTRACTOR_NAME')) },
      { field: 'country.label', header: this.translate.instant(_('CONTRACTS.TABLE.COUNTRY_LABEL')) },
      { field: 'street', header: this.translate.instant(_('CONTRACTS.TABLE.STREET')) },
      { field: 'zipCode', header: this.translate.instant(_('CONTRACTS.TABLE.ZIP_CODE')) },
      { field: 'city', header: this.translate.instant(_('CONTRACTS.TABLE.CITY')) },
      { field: 'taxNumber', header: this.translate.instant(_('CONTRACTS.TABLE.TAX_NUMBER')) }
    ];
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  handleContractorTableEvents(event: { type: 'create' | 'delete' | 'edit', data?: any }): void {
    this.modalContractorType = event.type;
    
    if (event.type === 'edit') {
      this.currentContract = event.data;
    }
    if (event.type === 'delete') {
      const tempContractor = this.contractors.find((contractor) => contractor.id === Number(event.data));
      if (tempContractor) {
        this.currentContract = tempContractor;
      }
    }
    this.visibleModal = true;
  }

  onModalVisibilityChange(visible: any): void {
    this.visibleModal = visible;
  }

  onUserContractorOverviewPreferencesChanges(userContractorOverviewPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userContractorOverviewPreferences));
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  onContractorDeleted(contractorId: number) {
    this.contractors = this.contractors.filter(contract => contract.id !== contractorId);
  }
  public messageOperation(message: {severity: string, summary: string, detail: string}): void {
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail))
    })
  }
  
  onContractorUpdated(updated: Contractor): void {
    const index = this.contractors.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      this.contractors[index] = { ...updated };
      this.contractors = [...this.contractors];
    }
  }

  onContractorCreated(newContractor: Contractor) {
    this.contractors.unshift(newContractor);
  }

}
