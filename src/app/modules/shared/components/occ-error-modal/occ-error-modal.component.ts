import { Component, EventEmitter, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-occ-error-modal',
  standalone: false,
  templateUrl: './occ-error-modal.component.html',
  styleUrl: './occ-error-modal.component.scss'
})
export class OccErrorModalComponent {
  @Output() close = new EventEmitter<void>();

   constructor(private readonly translate: TranslateService) {}

   onClose() {
    console.log("close")
    this.close.emit();
  }

  refreshPage(): void {
    window.location.reload(); 
  }
}
