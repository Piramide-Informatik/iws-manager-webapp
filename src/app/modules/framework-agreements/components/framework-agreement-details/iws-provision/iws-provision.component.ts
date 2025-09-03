import { Component, inject, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { InputNumber } from 'primeng/inputnumber';
import { ContractOrderCommissionUtils } from '../../../utils/contract-order-commission-utils';
import { ContractOrderCommission } from '../../../../../Entities/contractOrderCommission';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';
import { Column } from '../../../../../Entities/column';
import { BasicContract } from '../../../../../Entities/basicContract'; 

@Component({
  selector: 'app-iws-provision',
  standalone: false,
  templateUrl: './iws-provision.component.html',
  styleUrl: './iws-provision.component.scss'
})
export class IwsProvisionComponent implements OnInit, OnDestroy{
  private readonly contractCommissionUtils = inject(ContractOrderCommissionUtils);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly translate = inject(TranslateService);
  private langSubscription!: Subscription;
  
  @Input() basicContract!: BasicContract;
  
  public iwsCommissionFAForm!: FormGroup;
  public orderCommissionForm!: FormGroup;
  selectedOrderCommission!: null;
  orderCommissions: ContractOrderCommission[] = [];

  // Modal configuration
  public visibleModalIWSCommission: boolean = false;
  public typeModal: 'create' | 'edit' | 'delete' = 'create';
  @ViewChild('inputNumber') firstInput!: InputNumber;

  public isLoading: boolean = false;

  // Table IWS Commission configuration
  @ViewChild('dt') dt!: Table;
  public cols!: Column[];
  public selectedColumns!: Column[];
  userIwsProvisionPreferences: UserPreference = {};
  tableKey: string = 'IwsProvision'
  dataKeys = ['fromOrderValue', 'commission', 'minCommission'];

  constructor(){ }

  ngOnInit(): void {
    this.orderCommissionForm = new FormGroup({
      fixCommission: new FormControl(null, Validators.min(999.99)),
      maxCommission: new FormControl(null, Validators.min(99999999.99))
    });

    this.iwsCommissionFAForm = new FormGroup({
      fromOrderValue: new FormControl(null, [Validators.required]),
      provision: new FormControl(null, [Validators.required, Validators.max(100.00)]),
      minCommission: new FormControl(null, [Validators.required]),
    });
    
    this.updateHeadersAndColumns();
    this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateHeadersAndColumns();
      this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    if (this.basicContract?.id) {
    this.loadContractOrderCommissions();
    }
  }

  setBasicContract(contract: BasicContract): void {
    this.basicContract = contract;
    if (contract?.id) {
      this.loadContractOrderCommissions();
    }
  }

  private loadContractOrderCommissions(): void {
    if (!this.basicContract?.id) return;

    this.contractCommissionUtils.getAllContractOrderCommissions().subscribe({
      next: (commissions) => {
        this.orderCommissions = commissions.filter(commission => 
          commission.basicContract?.id === this.basicContract.id
        );
      },
      error: (error) => {
        console.error('Error loading contract order commissions:', error);
        this.orderCommissions = [];
      }
    });
  }

  ngOnDestroy(): void {
    if(this.langSubscription){
      this.langSubscription.unsubscribe();
    }
  }

  onUserIwsProvisionPreferencesChanges(userIwsProvisionPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userIwsProvisionPreferences));
  }

  private updateHeadersAndColumns(): void {
    this.loadColIwsProvisionHeaders();
    this.selectedColumns = [...this.cols];
  }

  loadColIwsProvisionHeaders(): void {
    this.cols = [
      { field: 'fromOrderValue', customClasses: ['align-right'], header: this.translate.instant('FRAMEWORK-AGREEMENTS.DETAIL.FORM_TABLE_IWS_COMMISSION.FROM_VALUE')},
      { field: 'commission', customClasses: ['align-right'], header: this.translate.instant('FRAMEWORK-AGREEMENTS.DETAIL.FORM_TABLE_IWS_COMMISSION.COMMISSION') },
      { field: 'minCommission', customClasses: ['align-right'], header: this.translate.instant('FRAMEWORK-AGREEMENTS.DETAIL.FORM_TABLE_IWS_COMMISSION.MIN_COMMISSION') }
    ];
  }

  onSubmit(): void {
    if (this.iwsCommissionFAForm.invalid) return

    this.isLoading = true;
    if(this.typeModal === 'create'){
      this.createContractOrderCommission();
    }else if(this.typeModal === 'edit'){
      console.log('edit')
    }
  }

  private createContractOrderCommission(): void {
    const newContractOrderCommission: Omit<ContractOrderCommission, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      basicContract: this.basicContract, 
      employmentContact: null,
      fromOrderValue: this.iwsCommissionFAForm.get('fromOrderValue')?.value ?? 0,
      commission: this.iwsCommissionFAForm.get('provision')?.value ?? 0,
      minCommission: this.iwsCommissionFAForm.get('minCommission')?.value ?? 0
    };

    this.contractCommissionUtils.addContractOrderCommission(newContractOrderCommission).subscribe({
      next: (createdCommission) => {
        this.isLoading = false;
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.closeModalIwsCommission();
        this.orderCommissions = [...this.orderCommissions, createdCommission];
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error);
        this.commonMessageService.showErrorCreatedMessage();
      }
    })
  }

  closeModalIwsCommission(){
    this.visibleModalIWSCommission = false;
    this.iwsCommissionFAForm.reset();
  }

  showModalIwsCommission(option: 'create' | 'edit' | 'delete', data?: any){
    this.typeModal = option;
    if(this.typeModal !== 'delete'){
      this.firstInputFocus();
    }
    
    if(data && this.typeModal === 'edit'){
      this.iwsCommissionFAForm.get('fromOrderValue')?.setValue(data?.fromOrderValue);
      this.iwsCommissionFAForm.get('provision')?.setValue(data?.commission);
      this.iwsCommissionFAForm.get('minCommission')?.setValue(data?.minCommission);
    }

    this.visibleModalIWSCommission = true;
  }

  private firstInputFocus(): void {
    setTimeout(()=>{
      if(this.firstInput.input.nativeElement){
        this.firstInput.input.nativeElement.focus();
      }
    },300)
  }
}