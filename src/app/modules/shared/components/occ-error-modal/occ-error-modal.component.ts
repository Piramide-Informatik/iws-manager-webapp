import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
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
  @Input() redirectRoute: string = '/customers';

  constructor(private readonly translate: TranslateService, private readonly router: Router) { }

  onClose() {
    console.log("close")
    this.close.emit();
  }

  refreshPage(): void {
    if (this.useEmitter) {
      this.refresh.emit();
    } else {
      if (this.errorType === 'UPDATE_UNEXISTED' || this.errorType === 'DELETE_UNEXISTED') {
        this.router.navigate([this.redirectRoute]);
      } else {
        window.location.reload();
      }
    }
  }

  getErrorMessage(): string {
    switch (this.errorType) {
      case 'UPDATE_UNEXISTED':
        return this.translate.instant('ERROR.OCC.TEXT.UPDATE_UNEXISTED');
      case 'DELETE_UNEXISTED':
        return this.translate.instant('ERROR.OCC.TEXT.DELETE_UNEXISTED');
      default:
        return this.translate.instant('ERROR.OCC.TEXT.UPDATE_UPDATED');
    }
  }

  getButtonText(): string {
    switch (this.errorType) {
      case 'UPDATE_UPDATED':
        return this.translate.instant('ERROR.OCC.BUTTON.REFRESH');
      default:
        return this.translate.instant('ERROR.OCC.BUTTON.REDIRECT');
    }
  }
}
