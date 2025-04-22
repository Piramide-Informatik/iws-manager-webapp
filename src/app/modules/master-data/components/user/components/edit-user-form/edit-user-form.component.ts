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
  ];

  allRoles: string[] = [
    'Projekte',
    'Rolle 3',
    'Zeiterfassung',
    'Administrator',
    'Finanzen',
  ];
  assignedRoles: string[] = [];
  availableRoles: string[] = [];

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

    this.resetRoles();
  }

  private resetRoles() {
    this.assignedRoles = [];
    this.availableRoles = [...this.allRoles];
    this.selectedAssignedRoles = [];
    this.selectedAvailableRoles = [];
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
    this.availableRoles = this.allRoles.filter(
      (role) => !this.assignedRoles.includes(role)
    );
  }

  saveUser() {
    const formValue = this.userForm.value;
    const name = `${formValue.firstName} ${formValue.lastName}`;
    const updatedUser = {
      ...formValue,
      name,
      assignedRoles: [...this.assignedRoles],
    };

    const index = this.users.findIndex(
      (u) => u.username === formValue.username
    );

    if (index !== -1) {
      this.users[index] = updatedUser;
    } else {
      this.users.push(updatedUser);
    }

    this.userForm.reset({ active: true });
    this.resetRoles();
  }

  private transferRoles(from: string[], to: string[], selected: string[]) {
    selected.forEach((role) => {
      if (!to.includes(role)) to.push(role);
    });
    from = from.filter((role) => !selected.includes(role));
    selected.length = 0;

    return from;
  }

  moveToAssigned() {
    this.availableRoles = this.transferRoles(
      this.availableRoles,
      this.assignedRoles,
      this.selectedAvailableRoles
    );
  }

  moveAllToAssigned() {
    this.assignedRoles.push(
      ...this.availableRoles.filter((r) => !this.assignedRoles.includes(r))
    );
    this.availableRoles = [];
    this.selectedAvailableRoles = [];
  }

  moveToAvailable() {
    this.assignedRoles = this.transferRoles(
      this.assignedRoles,
      this.availableRoles,
      this.selectedAssignedRoles
    );
  }

  moveAllToAvailable() {
    this.availableRoles.push(
      ...this.assignedRoles.filter((r) => !this.availableRoles.includes(r))
    );
    this.assignedRoles = [];
    this.selectedAssignedRoles = [];
  }
}
