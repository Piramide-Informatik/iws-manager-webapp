import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class CommonMessagesService {

  constructor( 
    private readonly messageService: MessageService,
    private readonly transaleService: TranslateService) { }

  showCreatedSuccesfullMessage() {
    this.messageService.add({
      severity: 'success',
      summary: this.transaleService.instant('MESSAGE.SUCCESS'),
      detail: this.transaleService.instant('MESSAGE.CREATE_SUCCESS')
    });    
  }

  showEditSucessfullMessage() {
    this.messageService.add({
      severity: 'success',
      summary: this.transaleService.instant('MESSAGE.SUCCESS'),
      detail: this.transaleService.instant('MESSAGE.UPDATE_SUCCESS')
    });
  }

  showDeleteSucessfullMessage() {
    this.messageService.add({
      severity: 'success',
      summary: this.transaleService.instant('MESSAGE.SUCCESS'),
      detail: this.transaleService.instant('MESSAGE.DELETE_SUCCESS')
    });
  }

  showErrorCreatedMessage() {
    this.messageService.add({
      severity: 'error',
      summary: this.transaleService.instant('MESSAGE.ERROR'),
      detail: this.transaleService.instant('MESSAGE.CREATE_FAILED')
    });
  }

  showErrorEditMessage() {
    this.messageService.add({
      severity: 'error',
      summary: this.transaleService.instant('MESSAGE.ERROR'),
      detail: this.transaleService.instant('MESSAGE.UPDATE_FAILED')
    });
  }

  showErrorDeleteMessage() {
    this.messageService.add({
      severity: 'error',
      summary: this.transaleService.instant('MESSAGE.ERROR'),
      detail: this.transaleService.instant('MESSAGE.DELETE_FAILED')
    });
  }
}
