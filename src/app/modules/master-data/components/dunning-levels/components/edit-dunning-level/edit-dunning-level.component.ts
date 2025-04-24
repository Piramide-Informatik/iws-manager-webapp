import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-dunning-level',
  standalone: false,
  templateUrl: './edit-dunning-level.component.html',
  styleUrl: './edit-dunning-level.component.scss'
})
export class EditDunningLevelComponent {

  editDunningLevelForm!: FormGroup;

  ngOnInit(): void {
    this.editDunningLevelForm = new FormGroup({
      dunningLevel: new FormControl('1', [Validators.required]),
      designation: new FormControl('', [Validators.required]),
      fee: new FormControl('', [Validators.required]),
      defaultInterest: new FormControl('', [Validators.required]),
      paymentTerm: new FormControl('', [Validators.required]),
      reminderText: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.editDunningLevelForm.valid) {
      console.log(this.editDunningLevelForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}
