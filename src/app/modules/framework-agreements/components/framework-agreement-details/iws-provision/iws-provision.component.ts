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
import { OccError, OccErrorType } from '../../../../shared/utils/occ-error';

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
  selectedOrderCommission: ContractOrderCommission | null = null;
  orderCommissions: ContractOrderCommission[] = [];
  contractOrderCommissionToEdit!: ContractOrderCommission;
  showOCCErrorModalContractOrderCommission: boolean = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  visibleModalIWSCommissionEntity = false;

  // Modal configuration
  public visibleModalIWSCommission: boolean = false;
  public typeModal: 'create' | 'edit' | 'delete' = 'create';
  @ViewChild('inputNumber') firstInput!: InputNumber;

  public isLoading: boolean = false;
  public isLoadingDelete: boolean = false;

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
      fromOrderValue: new FormControl(null),
      provision: new FormControl(null, [Validators.max(100.00)]),
      minCommission: new FormControl(null),
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

    this.contractCommissionUtils.getContractOrderCommissionsByBasicContractIdSortedByFromOrderValue(this.basicContract.id).subscribe({
      next: (commissions) => {
        this.orderCommissions = commissions
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
      { field: 'fromOrderValue', type: 'double' , styles: { width: 'auto' }, customClasses: ['align-right'], header: this.translate.instant('FRAMEWORK-AGREEMENTS.DETAIL.FORM_TABLE_IWS_COMMISSION.FROM_VALUE')},
      { field: 'commission', type: 'double', styles: { width: 'auto' }, customClasses: ['align-right'], header: this.translate.instant('FRAMEWORK-AGREEMENTS.DETAIL.FORM_TABLE_IWS_COMMISSION.COMMISSION') },
      { field: 'minCommission', type: 'double', styles: { width: 'auto' }, customClasses: ['align-right'], header: this.translate.instant('FRAMEWORK-AGREEMENTS.DETAIL.FORM_TABLE_IWS_COMMISSION.MIN_COMMISSION') }
    ];
  }

  onSubmit(): void {
    if (this.iwsCommissionFAForm.invalid) return

    if(this.typeModal === 'create'){
      this.createContractOrderCommission();
    }else if(this.typeModal === 'edit'){
      this.updateContractOrderCommission();
    }
  }

  private createContractOrderCommission(): void {
    this.isLoading = true;
    const newContractOrderCommission: Omit<ContractOrderCommission, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      basicContract: this.basicContract, 
      fromOrderValue: this.iwsCommissionFAForm.get('fromOrderValue')?.value ?? 0,
      commission: this.iwsCommissionFAForm.get('provision')?.value ?? 0,
      minCommission: this.iwsCommissionFAForm.get('minCommission')?.value ?? 0
    };

    this.contractCommissionUtils.addContractOrderCommission(newContractOrderCommission).subscribe({
      next: () => {
        this.isLoading = false;
        this.loadContractOrderCommissions();
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.closeModalIwsCommission();
      },
      error: (error) => {
        this.isLoading = false;
        this.commonMessageService.showErrorCreatedMessage();
      }
    })
  }

  private updateContractOrderCommission(): void {
    if (this.iwsCommissionFAForm.invalid) return;

    this.isLoading = true;
    const updatedCommission: ContractOrderCommission = {
      ...this.contractOrderCommissionToEdit,
      fromOrderValue: this.iwsCommissionFAForm.get('fromOrderValue')?.value ?? 0,
      commission: this.iwsCommissionFAForm.get('provision')?.value ?? 0,
      minCommission: this.iwsCommissionFAForm.get('minCommission')?.value ?? 0
    };
    console.log('para actualizado',updatedCommission)
    this.contractCommissionUtils.updateContractOrderCommission(updatedCommission).subscribe({
      next: (updated) => {
        console.log('actualizado',updated)
        this.isLoading = false;
        this.commonMessageService.showEditSucessfullMessage();
        this.closeModalIwsCommission();
        this.orderCommissions = this.orderCommissions.map(c => c.id === updated.id ? updated : c);
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.commonMessageService.showErrorEditMessage();
        this.closeModalIwsCommission();
        if(error instanceof OccError){
          this.showOCCErrorModalContractOrderCommission = true;
          this.occErrorType = error.errorType;
        }
      }
    });
  }

  closeModalIwsCommission(){
    this.visibleModalIWSCommission = false;
    this.iwsCommissionFAForm.reset();
    this.selectedOrderCommission = null;
  }

  showModalIwsCommission(option: 'create' | 'edit' | 'delete', data?: ContractOrderCommission): void {
    this.typeModal = option;
    
    if(data && this.typeModal === 'edit'){
      this.contractOrderCommissionToEdit = data;
      this.selectedOrderCommission = data;
      this.iwsCommissionFAForm.get('fromOrderValue')?.setValue(data?.fromOrderValue);
      this.iwsCommissionFAForm.get('provision')?.setValue(data?.commission);
      this.iwsCommissionFAForm.get('minCommission')?.setValue(data?.minCommission);
    }

    if(this.typeModal !== 'delete'){
      this.firstInputFocus();
    }

    this.visibleModalIWSCommission = true;
  }

 
  deleteCommission(commissionId: number){
    this.typeModal = 'delete';
    this.selectedOrderCommission = this.orderCommissions.find(oc => oc.id === commissionId) || null;
    
    if (this.selectedOrderCommission) {
      this.visibleModalIWSCommission = true;
    }
  }

  onIwsCommissionDeleteConfirm() {
    if (!this.selectedOrderCommission?.id) return

    this.isLoadingDelete = true;
    this.contractCommissionUtils.deleteContractOrderCommission(this.selectedOrderCommission.id).subscribe({
      next: () => {
        this.isLoadingDelete = false;
        this.visibleModalIWSCommission = false;
        this.visibleModalIWSCommissionEntity = false;
        this.orderCommissions = this.orderCommissions.filter(c => c.id !== this.selectedOrderCommission!.id);
        this.commonMessageService.showDeleteSucessfullMessage();
        this.selectedOrderCommission = null;
      },
      error: (error) => {
        this.isLoadingDelete = false;
        this.commonMessageService.showErrorDeleteMessage();
        this.handleDeleteError(error);
      }
    });
  }

  private handleDeleteError(error: any): void {
    if (error instanceof OccError || error?.message?.includes('404') ) {
      this.occErrorType = error.errorType;
      this.showOCCErrorModalContractOrderCommission = true;
    }
  }

  private firstInputFocus(): void {
    setTimeout(()=>{
      if(this.firstInput?.input?.nativeElement){
        this.firstInput.input.nativeElement.focus();
      }
    },300)
  }
}