import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FundingProgram } from '../../../../../Entities/fundingProgram';

@Injectable({ providedIn: 'root' })
export class FundingProgramStateService {
  private readonly editFundingProgramSource = new BehaviorSubject<FundingProgram | null>(null);
  currentFundingProgram$ = this.editFundingProgramSource.asObservable();

  setFundingProgramToEdit(fundingProgram: FundingProgram | null): void {
    this.editFundingProgramSource.next(fundingProgram);
  }

  clearFundingProgram() {
    this.editFundingProgramSource.next(null);
  }
}