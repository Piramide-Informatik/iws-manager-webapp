import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Salutation } from '../../../../../Entities/salutation';

@Injectable({ providedIn: 'root' })
export class SalutationStateService {
  private readonly editSalutationSource = new BehaviorSubject<Salutation | null>(null);
  currentSalutation$ = this.editSalutationSource.asObservable();

  setSalutationToEdit(salutation: Salutation | null): void {
    this.editSalutationSource.next(salutation);
  }

  clearSalutation() {
    this.editSalutationSource.next(null);
  }
}