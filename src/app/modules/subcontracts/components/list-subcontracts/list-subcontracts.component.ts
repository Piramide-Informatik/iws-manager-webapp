import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Table } from 'primeng/table';
import {TranslateService, _} from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { SubcontractUtils } from '../../utils/subcontracts-utils';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { Customer } from '../../../../Entities/customer';
import { Subcontract } from '../../../../Entities/subcontract';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { Column } from '../../../../Entities/column';

@Component({
  selector: 'app-list-subcontracts',
  standalone: false,
  templateUrl: './list-subcontracts.component.html',
  styleUrl: './list-subcontracts.component.scss'
})
export class ListSubcontractsComponent implements OnInit, OnDestroy {

  private readonly subcontractsUtils = inject(SubcontractUtils);
  private readonly customerUtils = inject(CustomerUtils);
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

  isDeletingSubcontract: boolean = false;

  subContractModalType: 'create' | 'delete' = 'create';

  constructor( private readonly translate: TranslateService,
               private readonly userPreferenceService: UserPreferenceService, 
               private readonly router:Router,
               private readonly route: ActivatedRoute,
               private readonly commonMessageService: CommonMessagesService){}

  
  ngOnInit(): void {

    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.userSubcontractsListPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userSubcontractsListPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.route.params.subscribe(params => {
      this.customerUtils.getCustomerById(params['id']).subscribe(customer => {
        this.customer = customer; 
      });
      this.subcontractsUtils.getAllSubcontractsByCustomerId(params['id']).subscribe(subcontracts => {
        this.subcontracts = subcontracts;
      })
    })

    this.subcontracts = [];
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
            header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.ORDER_TITLE'))
          },
          { field: 'contractor.name', classesTHead: ['width-13'], header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.CONTRACTOR'))},
          { field: 'projectCostCenter.costCenter', classesTHead: ['width-13'], customClasses: ['text-center'], header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.PROJECT'))},
          { field: 'date', type: 'date', classesTHead: ['width-13'], header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.DATE'))},
          { field: 'invoiceNo', classesTHead: ['width-13'], customClasses: ['align-left'], header: this.translate.instant(_('SUB-CONTRACTS.TABLE.INVOICE_NUMBER'))},
          { field: 'invoiceNet', classesTHead: ['width-13'], customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('SUB-CONTRACTS.TABLE.NET_INVOICE'))},
          { field: 'invoiceGross', classesTHead: ['width-13'], customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('SUB-CONTRACTS.TABLE.GROSS_INVOICE'))},
          { field: 'share', classesTHead: ['width-13'], header:   this.translate.instant(_('SUB-CONTRACTS.TABLE.SHARE'))}
        ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self:boolean,urlToNavigateTo ?:string){
   const url=self ? this.router.url :urlToNavigateTo;
   this.router.navigateByUrl('/',{skipLocationChange:true}).then(()=>{
     this.router.navigate([`/${url}`]).then(()=>{
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
    const subcontract = this.subcontracts.find( sub => sub.id === id);
    if (subcontract) {
      this.selectedSubcontract = subcontract
      this.subcontractName = subcontract.contractTitle
    }
    this.visibleSubcontractModal = true;
  }

  onCreateFrameworkAgreement(data: any) {
    this.subcontractsUtils.createNewSubcontract(data).subscribe({
      next: (createdSubContract) => {
        this.commonMessageService.showCreatedSuccesfullMessage();
        setTimeout(()=>{
          this.visibleSubcontractModal = false;
          this.navigationToEdit(createdSubContract.id);
        },2000)
      },
      error: (error) => {
        console.log(error);
        this.commonMessageService.showErrorCreatedMessage();
      }
    });
  }

  private navigationToEdit(id: number): void {
    this.router.navigate(['./subcontracts-details', id], { relativeTo: this.route });
  }

  onDeleteFrameworkAgreement(data: any) {
    this.subcontractsUtils.deleteSubcontract(data.id).subscribe({
      next: () => {
        this.isDeletingSubcontract = false;
        this.visibleSubcontractModal = false;
        this.subcontracts = this.subcontracts.filter(sc => sc.id !== data.id);
        this.commonMessageService.showDeleteSucessfullMessage();
      },
      error: (error) => {
        this.isDeletingSubcontract = false;
        if(error.message.includes('have associated subcontract projects') || 
           error.message.includes('have associated subcontract years')){
          this.commonMessageService.showErrorDeleteMessageContainsOtherEntities();
        } else {
          this.commonMessageService.showErrorDeleteMessage();
        }
      }
    });
  }

  onModalVisible(value: boolean) {
    this.visibleSubcontractModal = value;
  }
}
