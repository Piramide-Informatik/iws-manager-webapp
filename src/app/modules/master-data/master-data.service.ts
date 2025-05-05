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
    ];
  }

  getProjectStatusData(): any[]{
    return [
      { projectStatus: 'Alle' },
      { projectStatus: 'Angebot' },
      { projectStatus: 'Antrag' },
      { projectStatus: 'Bewilligt' },
      { projectStatus: 'Gestoppt' },
      { projectStatus: 'Stufe1' },
      { projectStatus: 'Stufe2' },
    ];
  }
  
  getNetworksData(): any[]{
    return [
      { network: "merepa11" },
      { network: "merepa21" },
      { network: "merepa22" },
      { network: "parcel11" },
      { network: "parcel21" },
      { network: "parcel22" },
      { network: "seeds11" },
      { network: "seeds21" },
      { network: "seeds22" },
    ];
  }

  getPartnersData(): any[]{
    return [
      { id: '1', customerNumber: '1617', partner: 'Capture-Media-Beteiligungs-GmbH' },
      { id: '2', customerNumber: '1529', partner: 'cibX GmbH' },
      { id: '3', customerNumber: '1100', partner: 'CorporateHealth - die Gesundheits' },
      { id: '4', customerNumber: '1622', partner: 'Datico Sport & Health GmbH' },
    ];
  }

  getRealizationProbabilitiesData(): any[]{
    return [
      { realizationProbabilities: '10'}, { realizationProbabilities: '50' },
      { realizationProbabilities: '75'}, { realizationProbabilities: '100' },
    ];
  }

  getProjectFunnelsData(): any[]{
    return [
      { id: '1601', projectSponsor: 'Deutsches Zentrum für Luft- und Raumfahrt e.V.' },
      { id: '1448', projectSponsor: 'VDI/VDE-Gesellschaft Mess- und Automatisierungstechnik' },
      { id: '1447', projectSponsor: 'VDI/VDE Innovation + Technik GmbH' },
    ];
  }
};