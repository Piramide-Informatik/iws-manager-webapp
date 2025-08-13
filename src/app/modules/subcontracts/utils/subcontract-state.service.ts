import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Subcontract } from '../../../Entities/subcontract';

@Injectable({ providedIn: 'root' })
export class SubcontractStateService {
  private readonly editSubcontractSource = new BehaviorSubject<Subcontract | null>(null);
  currentSubcontract$ = this.editSubcontractSource.asObservable();

  notifySubcontractUpdate(subcontract: Subcontract | null): void {
    this.editSubcontractSource.next(subcontract);
  }

  clearSubcontract() {
    this.editSubcontractSource.next(null);
  }
}