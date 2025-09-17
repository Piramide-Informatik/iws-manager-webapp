import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Chance } from '../../../../../Entities/chance';

@Injectable({ providedIn: 'root' })
export class ChanceStateService {
  private readonly editChanceSource = new BehaviorSubject<Chance | null>(null);
  currentChance$ = this.editChanceSource.asObservable();

  setChanceToEdit(chance: Chance | null): void {
    this.editChanceSource.next(chance);
  }

  clearChance() {
    this.editChanceSource.next(null);
  }
}