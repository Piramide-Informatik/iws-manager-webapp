import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-state-form',
  standalone: false,
  templateUrl: './state-form.component.html',
  styleUrl: './state-form.component.scss'
})
export class StateFormComponent implements OnInit{
  editStateForm!: FormGroup;

  ngOnInit(): void {
    this.editStateForm = new FormGroup({
      absenceType: new FormControl('', [Validators.required]),
      absenceTypeLabel: new FormControl('', [Validators.required]),
      shareOfDay: new FormControl('', [Validators.required]),
      stateName: new FormControl('', [Validators.required])
    });
  }

  onSubmit(): void {
    if (this.editStateForm.valid) {
      console.log(this.editStateForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}
