import { Component, EventEmitter, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-title-modal',
  standalone: false,
  templateUrl: './title-modal.component.html',
  styleUrl: './title-modal.component.scss'
})
export class TitleModalComponent {
  createTitleForm!: FormGroup;
  @Output() isVisibleModal = new EventEmitter<boolean>();


  onSubmit(): void{
    if (this.createTitleForm.valid) {
      this.isVisibleModal.emit(false);
    }
  }


}
