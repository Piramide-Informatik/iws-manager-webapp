import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { VatRate } from '../../../../../Entities/vatRate';

@Injectable({ providedIn: 'root' })
export class VatRateStateService {
  private readonly editVatRateSource = new BehaviorSubject<VatRate | null>(null);
  currentVatRate$ = this.editVatRateSource.asObservable();

  setVatRateToEdit(vatRate: VatRate | null): void {
    this.editVatRateSource.next(vatRate);
  }

  clearVatRate() {
    this.editVatRateSource.next(null);
  }
}