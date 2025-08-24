import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CostType } from '../../../../../Entities/costType';

@Injectable({ providedIn: 'root' })
export class CostTypeStateService {
  private readonly editCostTypeSource = new BehaviorSubject<CostType | null>(null);
  currentCostType$ = this.editCostTypeSource.asObservable();

  setCostTypeToEdit(costType: CostType | null): void {
    this.editCostTypeSource.next(costType);
  }

  clearCostType() {
    this.editCostTypeSource.next(null);
  }
}