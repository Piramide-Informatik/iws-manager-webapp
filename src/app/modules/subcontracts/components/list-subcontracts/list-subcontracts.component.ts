import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { SubcontractUtils } from '../../utils/subcontracts-utils';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { Customer } from '../../../../Entities/customer';
import { Subcontract } from '../../../../Entities/subcontract';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { Column } from '../../../../Entities/column';
import { Title } from '@angular/platform-browser';
import { CustomerStateService } from '../../../customer/utils/customer-state.service';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list-subcontracts',
  standalone: false,
  templateUrl: './list-subcontracts.component.html',
  styleUrl: './list-subcontracts.component.scss'
})
export class ListSubcontractsComponent implements OnInit, OnDestroy {

  private readonly subcontractsUtils = inject(SubcontractUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly titleService = inject(Title);
  private readonly customerStateService = inject(CustomerStateService);
  public customer!: Customer | undefined;
  public cols!: Column[];
  public subcontracts!: Subcontract[];
  @ViewChild('dt2') dt2!: Table;
  private langSubscription!: Subscription;
  public selectedColumns!: Column[];
  userSubcontractsListPreferences: UserPreference = {};
  tableKey: string = 'SubcontractsList'
  dataKeys = ['contractTitle', 'contractor', 'projectCostCenter', 'date', 'invoiceNo', 'invoiceNet', 'invoiceGross', 'share'];
  selectedSubcontract!: Subcontract;
  visibleSubcontractModal: boolean = false;
  subcontractName: string = '';
  public showOCCErrorModalSubcontract = false;
  public errorType: OccErrorType = 'DELETE_UNEXISTED';
  subContractModalType: 'create' | 'delete' = 'create';

  constructor(private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly commonMessageService: CommonMessagesService) { }


  ngOnInit(): void {
    this.updateTitle();
    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.userSubcontractsListPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userSubcontractsListPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
    this.route.params.subscribe(params => {
      const customerId = params['id'];

      this.customerStateService.currentCustomer$.pipe(take(1)).subscribe(currentCustomer => {
        if (currentCustomer) {
          this.customer = currentCustomer;
        } else {
          this.getCustomerId(customerId);
        }
      })

      this.subcontractsUtils.getAllSubcontractsByCustomerId(params['id']).subscribe(subcontracts => {
        this.subcontracts = subcontracts;
        for (let i = 0; i < this.subcontracts.length; i++) {
          const dateSubcontracts = this.subcontracts[i].date;
          this.subcontracts[i].date = dateSubcontracts ? new Date(dateSubcontracts) : null;
        }
      })
    })

    this.subcontracts = [];
  }

  getCustomerId(customerId: number): void {
    this.customerUtils.getCustomerById(customerId).subscribe(customer => {
      if (customer) {
        this.customer = customer;
      }
    });
  }

  private updateTitle(): void {
    this.titleService.setTitle(this.translate.instant('PAGETITLE.CUSTOMERS.SUBCONTRACTS'));
  }

  onUserSubcontractsListPreferencesChanges(userSubcontractsListPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userSubcontractsListPreferences));
  }

  loadColHeaders(): void {
    this.cols = [
      {
        field: 'contractTitle',
        classesTHead: ['width-13'],
        routerLink: (row: any) => `./subcontracts-details/${row.id}`,
        header: this.translate.instant(_('SUB-CONTRACTS.TABLE.ORDER_TITLE'))
      },
      { field: 'contractor.name', classesTHead: ['width-13'], header: this.translate.instant(_('SUB-CONTRACTS.TABLE.CONTRACTOR')) },
      { field: 'projectCostCenter.costCenter', classesTHead: ['width-13'], customClasses: ['text-center'], header: this.translate.instant(_('SUB-CONTRACTS.TABLE.PROJECT')) },
      { field: 'date', type: 'date', classesTHead: ['width-13'], header: this.translate.instant(_('SUB-CONTRACTS.TABLE.DATE')), filter: { type: 'date'} },
      { field: 'invoiceNo', classesTHead: ['width-13'], customClasses: ['align-left'], header: this.translate.instant(_('SUB-CONTRACTS.TABLE.INVOICE_NUMBER')) },
      { field: 'invoiceNet', classesTHead: ['width-13'], customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('SUB-CONTRACTS.TABLE.NET_INVOICE')), filter : { type: 'numeric' } },
      { field: 'invoiceGross', classesTHead: ['width-13'], customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('SUB-CONTRACTS.TABLE.GROSS_INVOICE')), filter : { type: 'numeric' } },
      { field: 'share', classesTHead: ['width-13'], header: this.translate.instant(_('SUB-CONTRACTS.TABLE.SHARE')), filter : { type: 'numeric' } }
    ];
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

  getModalHeader(): string {
    if (this.subContractModalType === 'create') {
      return this.translate.instant('SUB-CONTRACTS.LABEL.NEW_SUBCONTRACT');
    } else {
      return this.translate.instant('SUB-CONTRACTS.LABEL.DELETE_SUBCONTRACT');
    }
  }

  goToSubContractDetails() {
    this.subContractModalType = 'create';
    this.visibleSubcontractModal = true;
  }

  goToEditSubContractDetails(subcontract: Subcontract) {
    this.router.navigate(['subcontracts-details', subcontract.id], { relativeTo: this.route })
  }

  handleDeleteSubcontracts(id: number) {
    this.subContractModalType = 'delete';
    const subcontract = this.subcontracts.find(sub => sub.id === id);
    if (subcontract) {
      this.selectedSubcontract = subcontract
      this.subcontractName = subcontract.contractTitle
    }
    this.visibleSubcontractModal = true;
  }

  onCreateSubcontract(event: { created?: Subcontract, status: 'success' | 'error' }): void {
    if( event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onDeleteSubcontract(event: { deleted?: Subcontract, status: 'success' | 'error', error?: any }) {
    if(event.status === 'success' && event.deleted){
      this.subcontracts = this.subcontracts.filter(sc => sc.id !== event.deleted?.id)
      this.commonMessageService.showDeleteSucessfullMessage();
    }else if(event.status === 'error' && event.error){
      if (event.error instanceof OccError || event.error?.message?.includes('404') || event.error?.errorType === 'DELETE_UNEXISTED') {
        this.commonMessageService.showErrorDeleteMessage();
        this.showOCCErrorModalSubcontract = true;
        this.errorType = 'DELETE_UNEXISTED';
      } else if (event.error instanceof HttpErrorResponse && event.error.status === 500 && event.error.error.message.includes('foreign key constraint')) {
        this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(event.error.error.message);
      } else {
        this.commonMessageService.showErrorDeleteMessage();
      }
    }
  }

  onModalVisible(value: boolean) {
    this.visibleSubcontractModal = value;
  }
}
