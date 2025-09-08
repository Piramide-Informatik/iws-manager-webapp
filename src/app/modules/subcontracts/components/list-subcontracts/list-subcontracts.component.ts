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

  subContractModalType: string = '';

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
            routerLink: (row: any) => `./subcontracts-details/${row.id}`,
            header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.ORDER_TITLE'))
          },
          { field: 'contractor.name', header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.CONTRACTOR'))},
          { field: 'projectCostCenter.costCenter', customClasses: ['text-center'], header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.PROJECT'))},
          { field: 'date', type: 'date', header:  this.translate.instant(_('SUB-CONTRACTS.TABLE.DATE'))},
          { field: 'invoiceNo', customClasses: ['align-left'], header: this.translate.instant(_('SUB-CONTRACTS.TABLE.INVOICE_NUMBER'))},
          { field: 'invoiceNet', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('SUB-CONTRACTS.TABLE.NET_INVOICE'))},
          { field: 'invoiceGross', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('SUB-CONTRACTS.TABLE.GROSS_INVOICE'))},
          { field: 'share',header:   this.translate.instant(_('SUB-CONTRACTS.TABLE.SHARE'))}
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

  deleteSubcontract(id: any) {
    this.subContractModalType = 'delete';
    const sub = this.subcontracts.find( subcontract => subcontract.id !== id);
    if (sub) {
      this.selectedSubcontract = sub;
    }
    this.visibleSubcontractModal = true;
  }

  goToSubContractDetails() {
    this.subContractModalType = 'create';
    this.visibleSubcontractModal = true;
  }

  goToEditSubContractDetails(subcontract: Subcontract) {
    this.router.navigate(['subcontracts-details', subcontract.id], { relativeTo: this.route })
  }

  handleDeleteSubcontracts(id: number) {
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

  onModalHide() {
    this.subContractModalType = '';
  }
}
