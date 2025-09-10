import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Promoter } from '../../../../../Entities/promoter';

@Injectable({ providedIn: 'root' })
export class PromoterStateService {
  private readonly editPromoterSource = new BehaviorSubject<Promoter | null>(null);
  currentPromoter$ = this.editPromoterSource.asObservable();

  setPromoterToEdit(promoter: Promoter | null): void {
    this.editPromoterSource.next(promoter);
  }

  clearPromoter() {
    this.editPromoterSource.next(null);
  }
}