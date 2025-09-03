import { Component, ViewChild } from '@angular/core';
import { ContractStatusTableComponent } from './components/contract-status-table/contract-status-table.component';
import { ContractStatusFormComponent } from './components/contract-status-form/contract-status-form.component';

@Component({
  selector: 'app-contract-status',
  standalone: false,
  templateUrl: './contract-status.component.html',
  styleUrl: './contract-status.component.scss'
})
export class ContractStatusComponent {

  @ViewChild('contractTable')
  contractStatusTable!: ContractStatusTableComponent;
  @ViewChild('contractForm') 
  formContractStatus!: ContractStatusFormComponent;

  selectedContractStatusToEdit: any;


  onSelectedContractStatusToEdit(selectedContractStatusToEdit: any) {
    this.selectedContractStatusToEdit = selectedContractStatusToEdit;
  }

  onContractStatusToEdit(contractStatusToEdit: any) {
    if (contractStatusToEdit) {
      this.contractStatusTable.editContractStatus(contractStatusToEdit);
    }
  }

  onCancelEdit(contractStatus: any) {
    this.selectedContractStatusToEdit = contractStatus;
  }

}
