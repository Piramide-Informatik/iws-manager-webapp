import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Vat } from '../../../../../Entities/vat';

@Injectable({ providedIn: 'root' })
export class VatStateService {
  private readonly editVatSource = new BehaviorSubject<Vat | null>(null);
  currentVat$ = this.editVatSource.asObservable();

  setVatToEdit(vat: Vat | null): void {
    this.editVatSource.next(vat);
  }

  clearVat() {
    this.editVatSource.next(null);
  }
}