import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Contractor } from '../../../../Entities/contractor';
import { ContractorService } from '../../services/contractor.service';
import {TranslateService, _} from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

interface Column {
  field: string,
  header: string,
  customClasses?: string[],
  routerLink?: (row: any) => string
}

@Component({
  selector: 'app-contractor-overview',
  standalone: false,
  templateUrl: './contractor-overview.component.html',
  styleUrl: './contractor-overview.component.scss'
})
export class ContractorOverviewComponent implements OnInit, OnDestroy {

  public cols!: Column[];

  public contractors!: Contractor[];

  public customer!: string;

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  public selectedColumns!: Column[];

  userContractorOverviewPreferences: UserPreference = {};
  
  tableKey: string = 'ContractorOverview'
  
  dataKeys = ['contractorLabel', 'contractorName', 'countryLabel', 'street', 'zipCode', 'city', 'taxNro'];
  

  constructor(
    private readonly contractorService: ContractorService, 
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService, 
    private readonly router:Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit():void {
    this.loadContractOverviewHeaders();
    this.contractors = this.contractorService.list();

    this.selectedColumns = this.cols;

    this.customer = 'Joe Doe'
    this.userContractorOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadContractOverviewHeaders();
      this.reloadComponent(true);
      this.userContractorOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  loadContractOverviewHeaders(): void {
    this.cols = [
          { 
            field: 'contractorLabel', 
            routerLink: (row: any) => `./contract-details/${row.contractorLabel}`,
            header:  this.translate.instant(_('CONTRACTS.TABLE.CONTRACTOR_LABEL'))
          },
          { field: 'contractorName', header: this.translate.instant(_('CONTRACTS.TABLE.CONTRACTOR_NAME'))},
          { field: 'countryLabel', header: this.translate.instant(_('CONTRACTS.TABLE.COUNTRY_LABEL'))},
          { field: 'street', customClasses: ['align-right'], header: this.translate.instant(_('CONTRACTS.TABLE.STREET'))},
          { field: 'zipCode', header: this.translate.instant(_('CONTRACTS.TABLE.ZIP_CODE'))},
          { field: 'city', customClasses: ['align-right'], header: this.translate.instant(_('CONTRACTS.TABLE.CITY'))},
          { field: 'taxNro',  header: this.translate.instant(_('CONTRACTS.TABLE.TAX_NUMBER'))}
        ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onUserContractorOverviewPreferencesChanges(userContractorOverviewPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userContractorOverviewPreferences));
  }

  reloadComponent(self:boolean,urlToNavigateTo ?:string){
   const url=self ? this.router.url :urlToNavigateTo;
   this.router.navigateByUrl('/',{skipLocationChange:true}).then(()=>{
     this.router.navigate([`/${url}`]).then(()=>{
     })
   })
 }

  goToContractDetails(currentContract: Contractor) {
    this.router.navigate(['contract-details', currentContract.contractorLabel], { 
      relativeTo: this.route,
      state: { customer: "Joe Doe", contractData: currentContract } 
    });
  }

  createContractDetail() {
    this.router.navigate(['contract-details'], { 
      relativeTo: this.route
    });
  }

}
