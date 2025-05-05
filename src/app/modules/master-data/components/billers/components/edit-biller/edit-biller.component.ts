import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'master-data-edit-biller',
  standalone: false,
  templateUrl: './edit-biller.component.html',
  styleUrl: './edit-biller.component.scss'
})
export class EditBillerComponent {
  editBillerForm!: FormGroup;

  ngOnInit(): void {
    this.editBillerForm = new FormGroup({
      biller: new FormControl('IWS GmbH', [Validators.required]),
    });
  }

  onSubmit(): void {
    console.log(this.editBillerForm.value);
  }
}
