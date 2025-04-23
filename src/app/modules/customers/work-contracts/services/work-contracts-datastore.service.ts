import { Injectable } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { TranslateService, _ } from '@ngx-translate/core';

interface Column {
  field: string,
  header: string
}

@Injectable({
  providedIn: 'root',
})
export class WorkContractsDataService {
  constructor(
    private readonly translate: TranslateService,
  ) { }

  list(): WorkContract[] {
    return [
      {
        employeeId: 1,
        firstName: 'John',
        lastName: 'Doe',
        startDate: '03.04.2020',
        salaryPerMonth: 5040,
        weeklyHours: 40,
        worksShortTime: 3,
        specialPayment: 160,
        maxHrspPerMonth: 240,
        maxHrsPerDay: 8,
        hourlyRate: 348
      },
      {
        employeeId: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        startDate: '10.02.2021',
        salaryPerMonth: 4800,
        weeklyHours: 42,
        worksShortTime: 2.5,
        specialPayment: 120,
        maxHrspPerMonth: 245,
        maxHrsPerDay: 9,
        hourlyRate: 234
      },
      {
        employeeId: 3,
        firstName: 'Michael',
        lastName: 'Johnson',
        startDate: '15.09.2021',
        salaryPerMonth: 3850,
        weeklyHours: 41,
        worksShortTime: 3.1,
        specialPayment: 80,
        maxHrspPerMonth: 242,
        maxHrsPerDay: 8,
        hourlyRate: 169
      },
      {
        employeeId: 4,
        firstName: 'Emily',
        lastName: 'Williams',
        startDate: '11.11.2022',
        salaryPerMonth: 4380,
        weeklyHours: 42,
        worksShortTime: 2.5,
        specialPayment: 130,
        maxHrspPerMonth: 244,
        maxHrsPerDay: 9,
        hourlyRate: 215
      }
    ];
  }

  getWorkConstractsColums(): Column[] {
    return [
      { field: 'employeeId', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.EMPLOYEE_ID'))},
      { field: 'firstName', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.FIRST_NAME'))},
      { field: 'lastName', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.LAST_NAME'))},
      { field: 'startDate', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.START_DATE'))},
      { field: 'salaryPerMonth',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SALARY_PER_MONTH'))},
      { field: 'weeklyHours',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WEEKLY_HOURS'))},
      { field: 'worksShortTime',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WORK_SHORT_TIME'))},
      { field: 'specialPayment',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SPECIAL_PAYMENT'))},
      { field: 'maxHrspPerMonth', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_MONTH'))},
      { field: 'maxHrsPerDay',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_DAY'))},
      { field: 'hourlyRate',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.HOURLY_RATE'))},
    ];
  }
}

