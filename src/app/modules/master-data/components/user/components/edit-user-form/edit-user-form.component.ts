import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-user-form',
  templateUrl: './edit-user-form.component.html',
  styleUrls: ['./edit-user-form.component.scss'],
})
export class EditUserFormComponent {
  userForm: FormGroup;
  assignedRoles = ['Projekte', 'Rolle 3', 'Zeiterfassung'];
  availableRoles = ['Administrator', 'Finanzen'];

  constructor(private fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: ['paze'],
      firstName: ['Patrick'],
      lastName: ['Zessin'],
      email: ['p.zessin@iws-nord.de'],
      password: [''],
      active: [true],
    });
  }
}
