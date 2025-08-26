import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OrderCommission } from '../../../Entities/orderCommission';

@Injectable({ providedIn: 'root' })
export class OrderCommissionStateService {
  private readonly editOrderCommissionSource = new BehaviorSubject<OrderCommission | null>(null);
  currentOrderCommission$ = this.editOrderCommissionSource.asObservable();

  notifyOrderCommissionUpdate(orderCommission: OrderCommission | null): void {
    this.editOrderCommissionSource.next(orderCommission);
  }

  clearOrderCommission() {
    this.editOrderCommissionSource.next(null);
  }
}