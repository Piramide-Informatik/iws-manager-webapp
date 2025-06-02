import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CompanyType } from '../../../../../Entities/companyType';

@Injectable({ providedIn: 'root' })
export class TypeOfCompaniesStateService {
  private readonly editTypeOfCompanySource = new BehaviorSubject<CompanyType | null>(null);
  currentTypeOfCompany$ = this.editTypeOfCompanySource.asObservable();

  setTypeOfCompanyTypeToEdit(companyType: CompanyType | null): void {
    this.editTypeOfCompanySource.next(companyType);
  }
}