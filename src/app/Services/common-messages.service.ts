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
  
  showSuccessMessage(messageDetail: string){
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('MESSAGE.SUCCESS'),
      detail: this.translateService.instant(messageDetail)
    }); 
  }

  showErrorMessage(messageDetail: string){
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('MESSAGE.ERROR'),
      detail: this.translateService.instant(messageDetail)
    })
  }
}
