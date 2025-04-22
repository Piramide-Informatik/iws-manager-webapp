import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-approval-status',
  standalone: false,
  templateUrl: './edit-approval-status.component.html',
  styleUrl: './edit-approval-status.component.scss',
})
export class EditApprovalStatusComponent implements OnInit {
  editProjectCarrierForm!: FormGroup;
  isHoliday: boolean = false;
  canBeBooked: boolean = false;

  ngOnInit(): void {
    this.editProjectCarrierForm = new FormGroup({
      absenceType: this.requiredControl(),
      absenceTypeLabel: this.requiredControl(),
      shareOfDay: this.requiredControl(),
    });
  }

  private requiredControl(): FormControl {
    return new FormControl('', [Validators.required]);
  }

  onSubmit(): void {
    if (this.editProjectCarrierForm.valid) {
      console.log(this.editProjectCarrierForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}
