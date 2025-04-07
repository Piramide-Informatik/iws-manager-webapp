import { Injectable } from '@angular/core';
    
@Injectable()
export class EmployeeContractService {
    getEmployeeContractData() {
        return [
            {
                id: '1001',
                employeeId: '5010',
                startDate: '25/04/2021',
                salaryPerMonth: 3492,
                hoursPerWeek: 40,
                workShortTime: 5,
                maxHoursPerMonth: 280,
                maxHoursPerDay: 8,
                hourlyRate: 10,
                specialPayment: 1729
            },
            {
                id: '1001',
                employeeId: '5011',
                startDate: '12/05/2022',
                salaryPerMonth: 4285,
                hoursPerWeek: 40,
                workShortTime: 6,
                maxHoursPerMonth: 285,
                maxHoursPerDay: 7.5,
                hourlyRate: 9,
                specialPayment: 2051
            },
            {
                id: '1001',
                employeeId: '5012',
                startDate: '07/07/2022',
                salaryPerMonth: 4802,
                hoursPerWeek: 40,
                workShortTime: 5,
                maxHoursPerMonth: 283,
                maxHoursPerDay: 8,
                hourlyRate: 12,
                specialPayment: 3019
            }
        ];
    }

   

    getEmployeeContractsData() {
        return Promise.resolve(this.getEmployeeContractData());
    }


};