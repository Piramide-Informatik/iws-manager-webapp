import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-project-carrier',
  standalone: false,
  templateUrl: './edit-project-carrier.component.html',
  styleUrl: './edit-project-carrier.component.scss'
})
export class EditProjectCarrierComponent implements OnInit{
  editProjectCarrierForm!: FormGroup;
  isHoliday: boolean = false;
  canBeBooked: boolean = false;

  ngOnInit(): void {
    this.editProjectCarrierForm = new FormGroup({
      absenceType: new FormControl('', [Validators.required]),
      absenceTypeLabel: new FormControl('', [Validators.required]),
      shareOfDay: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.editProjectCarrierForm.valid) {
      console.log(this.editProjectCarrierForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}
