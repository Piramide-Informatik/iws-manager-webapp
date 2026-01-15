import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class CommonMessagesService {

  constructor( 
    private readonly messageService: MessageService,
    private readonly translateService: TranslateService) { }

  showCreatedSuccesfullMessage() {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('MESSAGE.SUCCESS'),
      detail: this.translateService.instant('MESSAGE.CREATE_SUCCESS')
    });    
  }

  showEditSucessfullMessage() {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('MESSAGE.SUCCESS'),
      detail: this.translateService.instant('MESSAGE.UPDATE_SUCCESS')
    });
  }

  showDeleteSucessfullMessage() {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('MESSAGE.SUCCESS'),
      detail: this.translateService.instant('MESSAGE.DELETE_SUCCESS')
    });
  }

  showErrorCreatedMessage() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: this.translateService.instant('MESSAGE.CREATE_FAILED')
    });
  }

  showErrorEditMessage() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: this.translateService.instant('MESSAGE.UPDATE_FAILED')
    });
  }

  showConflictMessage() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: this.translateService.instant('MESSAGE.CONFLICT')
    });
  }

  showErrorDeleteMessage() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: this.translateService.instant('MESSAGE.DELETE_FAILED')
    });
  }

  showErrorRecordAlreadyExist() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: this.translateService.instant('MESSAGE.RECORD_ALREADY_EXISTS')
    })
  }

  showErrorRecordAlreadyExistWithNumberEmployee() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: this.translateService.instant('EMPLOYEE.VALIDATION.EMPLOYEE_ID_EXISTS')
    })
  }

  
  showErrorDeleteMessageContainsOtherEntities() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: this.translateService.instant('MESSAGE.DELETE_ERROR_WITH_RECORDS')
    });
  }

  showErrorDeleteMessageUsedByOtherEntities() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: this.translateService.instant('MESSAGE.DELETE_ERROR_IN_USE')
    })
  }

  showErrorDeleteMessageUsedByEntityWithName(errorMessage: string) {
    const entityName = this.extractRelatedEntity(errorMessage);
    const entityNameTranslated = this.translateService.instant(`TABLES_BD.${entityName}`) || entityName;
    const detailMessage = this.translateService.instant('MESSAGE.DELETE_ERROR_IN_USE_WITH_ENTITY');
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: detailMessage + ' ' + entityNameTranslated
    })
  }

  showCustomSeverityAndMessage(severity: string, message: string, detail: string) {
    this.messageService.add({
      severity: severity,
      summary: this.translateService.instant(message),
      detail: this.translateService.instant(detail)
    })
  }

  showCustomSeverityAndMessageWithValue(severity: string, message: string, detail: string, value: any, sticky: boolean) {
    this.messageService.add({
      severity: severity,
      summary: this.translateService.instant(message),
      detail: this.translateService.instant(detail, { value }),
      sticky: sticky
    })
  }

  private extractRelatedEntity(errorMessage: string): string {
    const match = errorMessage.match(/foreign key constraint fails \(`[^`]+`\.`([^`]+)`/i);
    if (match?.[1]) {
      return match[1];
    }
    return 'unknown entity';
  }
  
  showErrorRecordAlreadyExistWithDunningLevel() {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: this.translateService.instant('DUNNING_LEVELS.VALIDATION.DUNNING_LVL_EXISTS')
    })
  }

  showInformationMessageUpdatedRecordNumber(numberRegister: any) {
    this.messageService.add({
      severity: 'info',
      summary: this.translateService.instant('MESSAGE.INFO'),
      detail: this.translateService.instant('MESSAGE.INFO_UPDATED_NUMBER', { value: numberRegister }),
      sticky: true
    })
  }

  showCustomError(message: string) {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: message
    })
  }
}
