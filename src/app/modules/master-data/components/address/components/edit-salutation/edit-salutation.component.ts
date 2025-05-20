import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'master-data-edit-salutation',
  standalone: false,
  templateUrl: './edit-salutation.component.html',
  styleUrl: './edit-salutation.component.scss'
})
export class EditSalutationComponent implements OnInit {
  editSalutationForm!: FormGroup;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() onNewSalutation = new EventEmitter<string>();
  @Input() editSalut: string = '';

  ngOnInit(): void {
    this.editSalutationForm = new FormGroup({
      salutation: new FormControl('', [Validators.required])
    });
  }

  ngOnChange(changes: SimpleChanges){
    if(changes['editSalut']){
      this.editSalutationForm.get('salutation')?.setValue(this.editSalut);
    }
  }

  onSubmit(): void {
    if (this.editSalutationForm.valid) {
      this.onNewSalutation.emit(this.editSalutationForm.value);
      this.isVisibleModal.emit(false);
    } 
  }

}
