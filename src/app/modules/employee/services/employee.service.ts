import { Injectable } from '@angular/core';
import { Employee } from '../../../Entities/employee';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  private employees: Employee[] = [
    {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      salutation: 'Mr.',
      title: 'Dr.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'MSc Computer Science',
      qualificationKmui: 'Certified Scrum Master'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      salutation: 'Ms.',
      title: 'Prof.',
      generalManagerSince: '10.12.2022',
      shareholderSince: '12.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'MBA',
      qualificationKmui: 'PMP Certification'
    },
    {
      id: 3,
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.brown@example.com',
      salutation: 'Dr.',
      title: 'Dr.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'PhD in AI',
      qualificationKmui: 'Certified AI Expert'
    },
    {
      id: 4,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      salutation: 'Ms.',
      title: 'Dr. Prof.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'BA Business Administration',
      qualificationKmui: 'Six Sigma Green Belt'
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Williams',
      email: 'david.williams@example.com',
      salutation: 'Mr.',
      title: 'Prof.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'MSc Software Engineering',
      qualificationKmui: 'AWS Certified Solutions Architect'
    },
    {
      id: 6,
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.davis@example.com',
      salutation: 'Ms.',
      title: 'Dr.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'MBA in HR',
      qualificationKmui: 'SHRM Certified'
    },
    {
      id: 7,
      firstName: 'Michael',
      lastName: 'Miller',
      email: 'michael.miller@example.com',
      salutation: 'Mr.',
      title: 'Prof.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'MBA in Marketing',
      qualificationKmui: 'Google Ads Certified'
    },
    {
      id: 8,
      firstName: 'Sophia',
      lastName: 'Garcia',
      email: 'sophia.garcia@example.com',
      salutation: 'Ms.',
      title: 'Dr.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'BA in Operations Management',
      qualificationKmui: 'Lean Six Sigma Black Belt'
    },
    {
      id: 9,
      firstName: 'William',
      lastName: 'Martinez',
      email: 'william.martinez@example.com',
      salutation: 'Mr.',
      title: 'Dr.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'MSc Data Science',
      qualificationKmui: 'Certified Data Scientist'
    },
    {
      id: 10,
      firstName: 'Charlotte',
      lastName: 'Rodriguez',
      email: 'charlotte.rodriguez@example.com',
      salutation: 'Ms.',
      title: 'Dr.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'MBA in Sales',
      qualificationKmui: 'Salesforce Certified'
    },
    {
      id: 11,
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@example.com',
      salutation: 'Mr.',
      title: 'Prof',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'BSc Product Management',
      qualificationKmui: 'Certified Product Manager'
    },
    {
      id: 12,
      firstName: 'Isabella',
      lastName: 'Taylor',
      email: 'isabella.taylor@example.com',
      salutation: 'Ms.',
      title: 'Dr.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'BA in Graphic Design',
      qualificationKmui: 'Adobe Certified Expert'
    },
    {
      id: 13,
      firstName: 'Alexander',
      lastName: 'Moore',
      email: 'alexander.moore@example.com',
      salutation: 'Mr.',
      title: 'Prof.',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'BSc in Computer Science',
      qualificationKmui: 'Certified Kubernetes Administrator'
    },
    {
      id: 14,
      firstName: 'Amelia',
      lastName: 'Hernandez',
      email: 'amelia.hernandez@example.com',
      salutation: 'Ms.',
      title: 'Prof',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'BSc Network Engineering',
      qualificationKmui: 'Cisco Certified Network Associate'
    },
    {
      id: 15,
      firstName: 'Ethan',
      lastName: 'Young',
      email: 'ethan.young@example.com',
      salutation: 'Mr.',
      title: 'Dr. Prof',
      generalManagerSince: '05.12.2022',
      shareholderSince: '07.10.2021',
      soleProprietorSince: '05.03.2023',
      coEntrepreneurSince: '03.03.2024',
      qualificationFz: 'BSc in Cybersecurity',
      qualificationKmui: 'Certified Ethical Hacker'
    }
  ];

  constructor() { }

  getEmployees(): Employee[] {
    return this.employees;
  }

  deleteEmployee(employeeId: number): void {
    this.employees = this.employees.filter(
      (employee) => employee.id !== employeeId
    );
  }
}
