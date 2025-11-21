import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FormStateService {
  private readonly orderValueFormSource = new BehaviorSubject<number | null>(null);
  orderValue$ = this.orderValueFormSource.asObservable();

  updateOrderValue(orderValue: number): void {
    this.orderValueFormSource.next(orderValue);
  }

  getCurrentOrderValue(): number | null {
    return this.orderValueFormSource.value;
  }

  clearOrderValue(): void {
    this.orderValueFormSource.next(null);
  }
}