import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PublicHoliday } from '../../../../../Entities/publicholiday';

@Injectable({ providedIn: 'root' })
export class PublicHolidayStateService {
    private readonly editPublicHolidaySource = new BehaviorSubject<PublicHoliday | null>(null);
    currentPublicHoliday$ = this.editPublicHolidaySource.asObservable();

    setPublicHolidayToEdit(publicHoliday: PublicHoliday | null): void {
        this.editPublicHolidaySource.next(publicHoliday)
    }

    clearPublicHoliday(): void {
        this.editPublicHolidaySource.next(null);
    }
}