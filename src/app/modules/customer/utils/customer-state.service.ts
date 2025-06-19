import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Customer } from '../../../Entities/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerStateService {
  private readonly editCustomerSource = new BehaviorSubject<Customer | null>(null);
  public currentCustomer$ = this.editCustomerSource.asObservable();
  
  setCustomerToEdit(customer: Customer | null): void {
    this.editCustomerSource.next(customer);
  }

  clearCustomer() {
    this.editCustomerSource.next(null);
  }
}
