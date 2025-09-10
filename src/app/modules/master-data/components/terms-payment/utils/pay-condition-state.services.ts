import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PayCondition } from '../../../../../Entities/payCondition';

@Injectable({ providedIn: 'root' })
export class PayConditionStateService {
  private readonly editPayConditionSource = new BehaviorSubject<PayCondition | null>(null);
  currentPayCondition$ = this.editPayConditionSource.asObservable();

  setPayConditionToEdit(payCondition: PayCondition | null): void {
    this.editPayConditionSource.next(payCondition);
  }

  clearPayCondition() {
    this.editPayConditionSource.next(null);
  }
}