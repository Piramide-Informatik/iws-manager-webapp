import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Contractor } from '../../../Entities/contractor';

@Injectable({ providedIn: 'root' })
export class ContractorStateService {
  private readonly editContractorSource = new BehaviorSubject<Contractor | null>(null);
  currentContractor$ = this.editContractorSource.asObservable();

  setContractorToEdit(contractor: Contractor | null): void {
    this.editContractorSource.next(contractor);
  }

  clearContractor() {
    this.editContractorSource.next(null);
  }
}