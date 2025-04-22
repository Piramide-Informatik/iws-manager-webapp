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

    const updatedUser = {
      ...formValue,
      name: `${formValue.firstName} ${formValue.lastName}`,
    };

    if (existingIndex !== -1) {
      this.users[existingIndex] = updatedUser;
    } else {
      this.users.push(updatedUser);
    }

    this.userForm.reset({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      active: true,
    });
    this.assignedRoles = [];
    this.availableRoles = ['Administrator', 'Finanzen'];
  }

  private transferRoles(
    from: string[],
    to: string[],
    selected: string[]
  ): void {
    selected.forEach((role) => {
      if (!to.includes(role)) {
        to.push(role);
      }
    });
    const updatedFrom = from.filter((role) => !selected.includes(role));
    from.length = 0;
    from.push(...updatedFrom);
    selected.length = 0;
  }

  moveToAssigned() {
    this.transferRoles(
      this.availableRoles,
      this.assignedRoles,
      this.selectedAvailableRoles
    );
  }

  moveAllToAssigned() {
    this.transferRoles(this.availableRoles, this.assignedRoles, [
      ...this.availableRoles,
    ]);
  }

  moveToAvailable() {
    this.transferRoles(
      this.assignedRoles,
      this.availableRoles,
      this.selectedAssignedRoles
    );
  }

  moveAllToAvailable() {
    this.transferRoles(this.assignedRoles, this.availableRoles, [
      ...this.assignedRoles,
    ]);
  }
}
