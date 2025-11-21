import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Order } from '../../../../../Entities/order';

@Injectable({ providedIn: 'root' })
export class OrderStateService {
  private readonly editOrderSource = new BehaviorSubject<Order | null>(null);
  currentOrder$ = this.editOrderSource.asObservable();

  notifyOrderUpdate(order: Order | null): void {
    this.editOrderSource.next(order);
  }

  clearOrder() {
    this.editOrderSource.next(null);
  }
}