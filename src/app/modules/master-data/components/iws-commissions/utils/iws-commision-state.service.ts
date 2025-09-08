import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IwsCommission } from '../../../../../Entities/iws-commission ';

@Injectable({ providedIn: 'root' })
export class IwsCommissionStateService {
    private readonly editIwsCommissionSource = new BehaviorSubject<IwsCommission | null>(null);
    currentIwsCommission$ = this.editIwsCommissionSource.asObservable();

    setIwsCommissionToEdit(user: IwsCommission | null): void {
        this.editIwsCommissionSource.next(user);
    }

    clearTitle() {
        this.editIwsCommissionSource.next(null);
    }
}