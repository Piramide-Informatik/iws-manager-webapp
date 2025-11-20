import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Debt } from '../../../../../Entities/debt';

@Injectable({ providedIn: 'root' })
export class ReceivableStateService {
  private readonly editReceivableSource = new BehaviorSubject<Debt | null>(null);
  currentReceivable$ = this.editReceivableSource.asObservable();

  notifyReceivableUpdate(receivable: Debt | null): void {
    this.editReceivableSource.next(receivable);
  }

  clearReceivable() {
    this.editReceivableSource.next(null);
  }
}