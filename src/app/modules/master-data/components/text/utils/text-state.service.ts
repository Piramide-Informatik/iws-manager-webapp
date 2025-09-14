import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Text } from '../../../../../Entities/text';

@Injectable({ providedIn: 'root' })
export class TextStateService {
  private readonly editTextSource = new BehaviorSubject<Text | null>(null);
  currentText$ = this.editTextSource.asObservable();

  setTextToEdit(text: Text | null): void {
    this.editTextSource.next(text);
  }

  clearText() {
    this.editTextSource.next(null);
  }
}