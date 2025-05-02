import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
    
@Injectable({
    providedIn: 'root'
  })
export class MasterDataService {
    constructor(private readonly translate: TranslateService) {}

    getApprovalStatusColumns(): any[] {
        return [
          { 
            field: 'approvalStatus', 
            minWidth: 110, 
            header: this.translate.instant('APPROVAL_STATUS.TABLE.APPROVAL_STATUS') 
          },
          { 
            field: 'order', 
            minWidth: 110, 
            header: this.translate.instant('APPROVAL_STATUS.TABLE.ORDER') 
          },
          { 
            field: 'projects', 
            minWidth: 110, 
            header: this.translate.instant('APPROVAL_STATUS.TABLE.PROJECTS') 
          },
          { 
            field: 'networks', 
            minWidth: 110, 
            header: this.translate.instant('APPROVAL_STATUS.TABLE.NETWORKS') 
          }
        ];
      }

  getDunningLevelsData(): any[] {
    return [
      {
        dunningLevel: 1,
        text: 'Zahlungserinnerung',
        fee: 5,
        defaultInterest: 1,
        paymentTerm: 1,
        reminderText: ''
      },
      {
        dunningLevel: 2,
        text: 'Mahnung',
        fee: 7,
        defaultInterest: 3,
        paymentTerm: 1,
        reminderText: ''
      },
      {
        dunningLevel: 3,
        text: 'Mahnung',
        fee: 7,
        defaultInterest: 3,
        paymentTerm: 1,
        reminderText: ''
      },
    ];
  }

  getEmployeeQualificationData(): any[]{
    return [
      { qualification: 'Sonstige', abbreviation: 'Sonst.'},
      { qualification: 'Techniker', abbreviation: 'Tech.'},
      { qualification: 'Wissenschaftler', abbreviation: 'Wiss.'},
    ]
  }

  getProjectFunnelsData(): any[]{
    return [
      { id: '1601', projectSponsor: 'Deutsches Zentrum für Luft- und Raumfahrt e.V.' },
      { id: '1448', projectSponsor: 'VDI/VDE-Gesellschaft Mess- und Automatisierungstechnik' },
      { id: '1447', projectSponsor: 'VDI/VDE Innovation + Technik GmbH' },
    ];
  }
};