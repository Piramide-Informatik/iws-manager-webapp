import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-iws-staff',
  standalone: false,
  templateUrl: './edit-iws-staff.component.html',
  styleUrl: './edit-iws-staff.component.scss',
})
export class EditIwsStaffComponent implements OnInit {
  editIwsStaffForm!: FormGroup;

  teams = [
    { name: 'Team 1', code: 'T1' },
    { name: 'Team 2', code: 'T2' },
    { name: 'Team 3', code: 'T3' },
  ];

  ngOnInit(): void {
    this.editIwsStaffForm = new FormGroup({
      staffId: new FormControl('', [Validators.required]),
      shortName: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      team: new FormControl('', [Validators.required]),
      staffSince: new FormControl(null),
      staffUntil: new FormControl(null),
    });
  }

  onSubmit(): void {
    if (this.editIwsStaffForm.valid) {
      console.log(this.editIwsStaffForm.value);
    } else {
      console.log('Formulario inválido');
    }
  }

  cancelEdit(): void {
    console.log('Edición cancelada');
    this.editIwsStaffForm.reset();
  }
}
