import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(private readonly translate: TranslateService) {}

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
}
