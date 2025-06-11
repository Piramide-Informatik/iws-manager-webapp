import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { State } from '../../../../../Entities/state';

@Injectable({
  providedIn: 'root'
})
export class StatesStateService {
  private readonly editStateSource = new BehaviorSubject<State | null>(null);
  currentState$ = this.editStateSource.asObservable();

  setStateToEdit(state: State | null): void {
    this.editStateSource.next(state);
  }
}
