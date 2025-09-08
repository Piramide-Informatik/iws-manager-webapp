import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AbsenceType } from '../../../../../Entities/absenceType';

@Injectable({ providedIn: 'root' })
export class AbsenceTypeStateService {
  private readonly editAbsenceTypeSource = new BehaviorSubject<AbsenceType | null>(null);
  currentAbsenceType$ = this.editAbsenceTypeSource.asObservable();

  setAbsenceTypeToEdit(absenceType: AbsenceType | null): void {
    this.editAbsenceTypeSource.next(absenceType);
  }

  clearAbsenceType() {
    this.editAbsenceTypeSource.next(null);
  }
}