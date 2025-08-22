import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ContractStatus } from '../../../../../Entities/contractStatus';

@Injectable({ providedIn: 'root' })
export class ContractStatusStateService {
  private readonly editContractStatusSource = new BehaviorSubject<ContractStatus | null>(null);
  currentContractStatus$ = this.editContractStatusSource.asObservable();

  setContractStatusToEdit(contractStatus: ContractStatus | null): void {
    this.editContractStatusSource.next(contractStatus);
  }

  clearContractStatus() {
    this.editContractStatusSource.next(null);
  }
}