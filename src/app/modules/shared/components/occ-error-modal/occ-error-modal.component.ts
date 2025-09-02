import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type OccErrorType = 'UPDATE_UPDATED' | 'UPDATE_UNEXISTED' | 'DELETE_UNEXISTED';

@Component({
  selector: 'app-occ-error-modal',
  standalone: false,
  templateUrl: './occ-error-modal.component.html',
  styleUrl: './occ-error-modal.component.scss'
})
export class OccErrorModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Input() useEmitter = false;
  @Input() errorType: OccErrorType = 'UPDATE_UPDATED';

  constructor(private readonly translate: TranslateService) { }

  onClose() {
    console.log("close")
    this.close.emit();
  }

  refreshPage(): void {
    if (this.useEmitter) {
      this.refresh.emit();
    } else {
      window.location.reload();
    }
  }

  getErrorMessage(): string {
    switch (this.errorType) {
      case 'UPDATE_UPDATED':
        return this.translate.instant('ERROR.OCC.TEXT.UPDATE_UPDATED');
      case 'UPDATE_UNEXISTED':
        return this.translate.instant('ERROR.OCC.TEXT.UPDATE_UNEXISTED');
      case 'DELETE_UNEXISTED':
        return this.translate.instant('ERROR.OCC.TEXT.DELETE_UNEXISTED');
      default:
        return this.translate.instant('ERROR.OCC.TEXT.UPDATE_UPDATED');
    }
  }
}
