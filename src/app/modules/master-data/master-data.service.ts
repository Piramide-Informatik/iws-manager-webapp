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
};