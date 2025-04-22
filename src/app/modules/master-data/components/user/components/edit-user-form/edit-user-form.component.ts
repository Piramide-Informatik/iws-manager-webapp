import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-user-form',
  templateUrl: './edit-user-form.component.html',
  styleUrls: ['./edit-user-form.component.scss'],
  standalone: false,
})
export class EditUserFormComponent {
  userForm: FormGroup;

  users = [
    { username: 'loschu', name: 'Schulte Lothar', active: true },
    { username: 'paze', name: 'Zessin Patrick', active: true },
    { username: 'mariah', name: 'Hernandez Maria', active: false },
    { username: 'jdoe', name: 'Doe John', active: true },
    { username: 'adamsa', name: 'Adams Sarah', active: true },
    { username: 'mgonzalez', name: 'Gonzalez Miguel', active: false },
    { username: 'klausw', name: 'Weber Klaus', active: true },
    { username: 'tanja', name: 'Müller Tanja', active: true },
    { username: 'bernardf', name: 'Fischer Bernard', active: false },
    { username: 'ljimenez', name: 'Jimenez Luis', active: true },
  ];

  assignedRoles: string[] = ['Projekte', 'Rolle 3', 'Zeiterfassung'];
  availableRoles: string[] = ['Administrator', 'Finanzen'];

  selectedAssignedRoles: string[] = [];
  selectedAvailableRoles: string[] = [];

  constructor(private readonly fb: FormBuilder) {
    this.userForm = this.fb.group({
      username: [''],
      firstName: [''],
      lastName: [''],
      email: [''],
      password: [''],
      active: [true],
    });
  }

  editUser(user: any) {
    this.userForm.patchValue({
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      active: user.active,
    });

    this.assignedRoles = user.assignedRoles ?? [];

    this.availableRoles = ['Administrator', 'Finanzen'].filter(
      (role) => !this.assignedRoles.includes(role)
    );
  }

  saveUser() {
    const formValue = this.userForm.value;

    const existingIndex = this.users.findIndex(
      (u) => u.username === formValue.username
    );

    if (existingIndex !== -1) {
      this.users[existingIndex] = {
        ...formValue,
        name: `${formValue.firstName} ${formValue.lastName}`,
      };
    } else {
      this.users.push({
        ...formValue,
        name: `${formValue.firstName} ${formValue.lastName}`,
      });
    }

    this.userForm.reset({ active: true });
  }

  moveToAssigned() {
    this.selectedAvailableRoles.forEach((role) => {
      if (!this.assignedRoles.includes(role)) {
        this.assignedRoles.push(role);
      }
    });
    this.availableRoles = this.availableRoles.filter(
      (role) => !this.selectedAvailableRoles.includes(role)
    );
    this.selectedAvailableRoles = [];
  }

  moveAllToAssigned() {
    this.assignedRoles.push(
      ...this.availableRoles.filter((r) => !this.assignedRoles.includes(r))
    );
    this.availableRoles = [];
    this.selectedAvailableRoles = [];
  }

  moveToAvailable() {
    this.selectedAssignedRoles.forEach((role) => {
      if (!this.availableRoles.includes(role)) {
        this.availableRoles.push(role);
      }
    });
    this.assignedRoles = this.assignedRoles.filter(
      (role) => !this.selectedAssignedRoles.includes(role)
    );
    this.selectedAssignedRoles = [];
  }

  moveAllToAvailable() {
    this.availableRoles.push(
      ...this.assignedRoles.filter((r) => !this.availableRoles.includes(r))
    );
    this.assignedRoles = [];
    this.selectedAssignedRoles = [];
  }
}
