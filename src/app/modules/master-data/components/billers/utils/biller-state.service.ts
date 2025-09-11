import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Biller } from '../../../../../Entities/biller';

@Injectable({ providedIn: 'root' })
export class BillerStateService {
  private readonly editBillerSource = new BehaviorSubject<Biller | null>(null);
  currentBiller$ = this.editBillerSource.asObservable();

  setBillerToEdit(biller: Biller | null): void {
    this.editBillerSource.next(biller);
  }

  clearBiller() {
    this.editBillerSource.next(null);
  }
}