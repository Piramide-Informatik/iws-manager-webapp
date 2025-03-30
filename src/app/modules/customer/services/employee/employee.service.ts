import { Injectable } from '@angular/core';
import { Employee } from '../../../../Entities/Employee';

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
      title: 'Software Engineer',
      generalManagerSince: '2020-05-15',
      shareholderSince: '2021-07-10',
      soleProprietorSince: '',
      coEntrepreneurSince: '',
      qualificationFz: 'MSc Computer Science',
      qualificationKmui: 'Certified Scrum Master'
    },
    {
      id: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      salutation: 'Ms.',
      title: 'Project Manager',
      generalManagerSince: '',
      shareholderSince: '2019-08-20',
      soleProprietorSince: '2018-03-12',
      coEntrepreneurSince: '',
      qualificationFz: 'MBA',
      qualificationKmui: 'PMP Certification'
    },
    {
      id: 3,
      firstName: 'Robert',
      lastName: 'Brown',
      email: 'robert.brown@example.com',
      salutation: 'Dr.',
      title: 'CTO',
      generalManagerSince: '2017-09-01',
      shareholderSince: '2016-04-05',
      soleProprietorSince: '',
      coEntrepreneurSince: '2015-06-20',
      qualificationFz: 'PhD in AI',
      qualificationKmui: 'Certified AI Expert'
    },
    {
      id: 4,
      firstName: 'Alice',
      lastName: 'Johnson',
      email: 'alice.johnson@example.com',
      salutation: 'Ms.',
      title: 'Business Analyst',
      generalManagerSince: '',
      shareholderSince: '2020-11-10',
      soleProprietorSince: '2017-09-22',
      coEntrepreneurSince: '',
      qualificationFz: 'BA Business Administration',
      qualificationKmui: 'Six Sigma Green Belt'
    },
    {
      id: 5,
      firstName: 'David',
      lastName: 'Williams',
      email: 'david.williams@example.com',
      salutation: 'Mr.',
      title: 'Software Architect',
      generalManagerSince: '2021-02-20',
      shareholderSince: '2020-01-18',
      soleProprietorSince: '',
      coEntrepreneurSince: '2019-03-15',
      qualificationFz: 'MSc Software Engineering',
      qualificationKmui: 'AWS Certified Solutions Architect'
    },
    {
      id: 6,
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma.davis@example.com',
      salutation: 'Ms.',
      title: 'HR Manager',
      generalManagerSince: '',
      shareholderSince: '2018-07-09',
      soleProprietorSince: '2015-01-30',
      coEntrepreneurSince: '',
      qualificationFz: 'MBA in HR',
      qualificationKmui: 'SHRM Certified'
    },
    {
      id: 7,
      firstName: 'Michael',
      lastName: 'Miller',
      email: 'michael.miller@example.com',
      salutation: 'Mr.',
      title: 'Marketing Director',
      generalManagerSince: '2019-06-10',
      shareholderSince: '2021-02-01',
      soleProprietorSince: '',
      coEntrepreneurSince: '2018-10-12',
      qualificationFz: 'MBA in Marketing',
      qualificationKmui: 'Google Ads Certified'
    },
    {
      id: 8,
      firstName: 'Sophia',
      lastName: 'Garcia',
      email: 'sophia.garcia@example.com',
      salutation: 'Ms.',
      title: 'Operations Manager',
      generalManagerSince: '2016-04-22',
      shareholderSince: '2018-11-16',
      soleProprietorSince: '',
      coEntrepreneurSince: '2017-07-05',
      qualificationFz: 'BA in Operations Management',
      qualificationKmui: 'Lean Six Sigma Black Belt'
    },
    {
      id: 9,
      firstName: 'William',
      lastName: 'Martinez',
      email: 'william.martinez@example.com',
      salutation: 'Mr.',
      title: 'Data Scientist',
      generalManagerSince: '2020-03-14',
      shareholderSince: '2019-10-30',
      soleProprietorSince: '',
      coEntrepreneurSince: '2018-09-08',
      qualificationFz: 'MSc Data Science',
      qualificationKmui: 'Certified Data Scientist'
    },
    {
      id: 10,
      firstName: 'Charlotte',
      lastName: 'Rodriguez',
      email: 'charlotte.rodriguez@example.com',
      salutation: 'Ms.',
      title: 'Sales Manager',
      generalManagerSince: '2021-08-05',
      shareholderSince: '2020-04-14',
      soleProprietorSince: '',
      coEntrepreneurSince: '2019-12-22',
      qualificationFz: 'MBA in Sales',
      qualificationKmui: 'Salesforce Certified'
    },
    {
      id: 11,
      firstName: 'James',
      lastName: 'Wilson',
      email: 'james.wilson@example.com',
      salutation: 'Mr.',
      title: 'Product Manager',
      generalManagerSince: '2022-05-01',
      shareholderSince: '2021-03-15',
      soleProprietorSince: '',
      coEntrepreneurSince: '2020-11-28',
      qualificationFz: 'BSc Product Management',
      qualificationKmui: 'Certified Product Manager'
    },
    {
      id: 12,
      firstName: 'Isabella',
      lastName: 'Taylor',
      email: 'isabella.taylor@example.com',
      salutation: 'Ms.',
      title: 'UI/UX Designer',
      generalManagerSince: '2018-09-01',
      shareholderSince: '2020-02-22',
      soleProprietorSince: '',
      coEntrepreneurSince: '2019-04-14',
      qualificationFz: 'BA in Graphic Design',
      qualificationKmui: 'Adobe Certified Expert'
    },
    {
      id: 13,
      firstName: 'Alexander',
      lastName: 'Moore',
      email: 'alexander.moore@example.com',
      salutation: 'Mr.',
      title: 'Full Stack Developer',
      generalManagerSince: '2021-12-12',
      shareholderSince: '2020-06-08',
      soleProprietorSince: '',
      coEntrepreneurSince: '2019-11-22',
      qualificationFz: 'BSc in Computer Science',
      qualificationKmui: 'Certified Kubernetes Administrator'
    },
    {
      id: 14,
      firstName: 'Amelia',
      lastName: 'Hernandez',
      email: 'amelia.hernandez@example.com',
      salutation: 'Ms.',
      title: 'Network Engineer',
      generalManagerSince: '2017-01-20',
      shareholderSince: '2019-07-25',
      soleProprietorSince: '',
      coEntrepreneurSince: '2018-08-30',
      qualificationFz: 'BSc Network Engineering',
      qualificationKmui: 'Cisco Certified Network Associate'
    },
    {
      id: 15,
      firstName: 'Ethan',
      lastName: 'Young',
      email: 'ethan.young@example.com',
      salutation: 'Mr.',
      title: 'Security Analyst',
      generalManagerSince: '2019-04-10',
      shareholderSince: '2021-03-18',
      soleProprietorSince: '',
      coEntrepreneurSince: '2020-01-12',
      qualificationFz: 'BSc in Cybersecurity',
      qualificationKmui: 'Certified Ethical Hacker'
    }
  ];

  constructor() { }

  getEmployees(): Employee[] {
    return this.employees;
  }
}
