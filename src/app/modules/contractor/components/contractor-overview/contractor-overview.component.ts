import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { Contractor } from '../../../../Entities/contractor';
import { TranslateService, _ } from "@ngx-translate/core";
import { BehaviorSubject, Subscription, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { ContractorUtils } from '../../utils/contractor-utils';
import { Customer } from '../../../../Entities/customer';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { MessageService } from 'primeng/api';
import { Column } from '../../../../Entities/column';
import { Title } from '@angular/platform-browser';
import { CustomerStateService } from '../../../customer/utils/customer-state.service';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { OccErrorType } from '../../../shared/utils/occ-error';

@Component({
  selector: 'app-contractor-overview',
  standalone: false,
  templateUrl: './contractor-overview.component.html',
  styleUrl: './contractor-overview.component.scss',
  providers: [MessageService]
})
export class ContractorOverviewComponent implements OnInit, OnDestroy {
  public cols!: Column[];
  public customer!: Customer | undefined;
  @ViewChild('dt2') dt2!: Table;
  private subscription!: Subscription;
  public selectedColumns!: Column[];

  userContractorOverviewPreferences: UserPreference = {};
  tableKey: string = 'ContractorOverview'

  dataKeys = ['label', 'name', 'countryLabel', 'street', 'zipCode', 'city', 'taxNro'];
  modalContractorType: 'create' | 'delete' | 'edit' = 'create';
  visibleModal: boolean = false;
  currentContract!: Contractor;
  customerId!: number;

  public contractors!: Contractor[];

  public showOCCErrorModalContractor = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  private readonly contractorsSubject = new BehaviorSubject<Contractor[]>([]);
  public contractors$ = this.contractorsSubject.asObservable();

  private readonly contractorUtils = inject(ContractorUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly titleService = inject(Title);
  private readonly customerStateService = inject(CustomerStateService);
  private readonly commonMessageService = inject(CommonMessagesService);


  ngOnInit(): void {
    this.updateTitle();
    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.userContractorOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.subscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userContractorOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.route.params.subscribe(params => {
      this.customerId = params['id'];

      this.customerStateService.currentCustomer$.pipe(take(1)).subscribe(currentCustomer => {
        if (currentCustomer) {
          this.customer = currentCustomer;
        } else {
          this.getCustomerById(this.customerId);
        }
      })

      this.loadContractors();
    });
  }

  private loadContractors(): void {
    this.contractorUtils.getAllContractorsByCustomerIdSortedByLabel(this.customerId).subscribe(contractors => {
      this.contractors = contractors; 
      this.contractorsSubject.next(contractors); 
    });
  }

  private getCustomerById(customerId: number): void {
    this.customerUtils.getCustomerById(customerId).subscribe(customer => {
      if (customer) {
        this.customer = customer;
      }
    });
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'label', customClasses:['fix-td-width-contractor-label'], header: this.translate.instant(_('CONTRACTS.TABLE.CONTRACTOR_LABEL')) },
      { field: 'name', customClasses:['fix-td-width-contractor-name'], header: this.translate.instant(_('CONTRACTS.TABLE.CONTRACTOR_NAME')) },
      { field: 'country.label', header: this.translate.instant(_('CONTRACTS.TABLE.COUNTRY_LABEL')) },
      { field: 'street', customClasses:['fix-td-width-contractor-street'], header: this.translate.instant(_('CONTRACTS.TABLE.STREET')) },
      { field: 'zipCode', header: this.translate.instant(_('CONTRACTS.TABLE.ZIP_CODE')) },
      { field: 'city', customClasses:['fix-td-width-contractor-street'], header: this.translate.instant(_('CONTRACTS.TABLE.CITY')) },
      { field: 'taxNumber', customClasses:['fix-td-width-contractor-taxNo'], header: this.translate.instant(_('CONTRACTS.TABLE.TAX_NUMBER')) }
    ];
  }

  private updateTitle(): void {
    this.titleService.setTitle(`${this.translate.instant('PAGETITLE.CUSTOMERS.CONTRACTORS')}`)
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
    this.contractorsSubject.next(this.contractors);
  }

  onContractorUpdated(updated: Contractor): void {
    const index = this.contractors.findIndex(c => c.id === updated.id);
    if (index !== -1) {
      this.contractors[index] = { ...updated };
      this.contractors = [...this.contractors];
      this.contractorsSubject.next(this.contractors);
      this.loadContractors();
    }
  }

  onContractorCreated(event: { status: 'success' | 'error' }): void {
    if (event.status === 'success') {
      this.loadContractors()
      this.prepareTableData();
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  private prepareTableData() {
    if (this.contractors.length > 0) {
      this.cols = [
        { field: 'label', header: 'label' },
        { field: 'name', header: 'name' },
        { field: 'country.label', header: 'country' },
        { field: 'street', header: 'street' },
        { field: 'zipCode', header: 'zipCode' },
        { field: 'city', header: 'city' },
        { field: 'taxNumber', header: 'taxNumber' },
      ];
    }
  }

}
