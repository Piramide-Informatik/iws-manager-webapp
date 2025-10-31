import { Component, OnInit, ViewChild } from '@angular/core';
import { ContractStatusTableComponent } from './components/contract-status-table/contract-status-table.component';
import { ContractStatusFormComponent } from './components/contract-status-form/contract-status-form.component';
import { PageTitleService } from '../../../../shared/services/page-title.service';

@Component({
  selector: 'app-contract-status',
  standalone: false,
  templateUrl: './contract-status.component.html',
  styleUrl: './contract-status.component.scss'
})
export class ContractStatusComponent implements OnInit{

  @ViewChild('contractTable')
  contractStatusTable!: ContractStatusTableComponent;
  @ViewChild('contractForm') 
  formContractStatus!: ContractStatusFormComponent;
  isLoading = false;
  selectedContractStatusToEdit: any;

  constructor(private readonly pageTitleService: PageTitleService) {}

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.MASTER_DATA.CONTRACT_STATUS');
  }

  get contractStatusValues() {
    return this.contractStatusTable ? this.contractStatusTable.contractStatusValues() : [];
  }


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
