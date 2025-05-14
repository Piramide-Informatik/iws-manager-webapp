import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-user-form',
  templateUrl: './edit-user-form.component.html',
  styleUrls: ['./edit-user-form.component.scss'],
  standalone: false,
})
export class EditUserFormComponent {

  @Output() userSaved = new EventEmitter<any>();

  userForm: FormGroup;
  allRoles: { name: string }[] = [
    { name: 'Projekte' },
    { name: 'Rolle 3' },
    { name: 'Zeiterfassung' },
    { name: 'Administrator' },
    { name: 'Finanzen' }
  ];

  assignedRoles: { name: string }[] = [];
  availableRoles: { name: string }[] = [];

  selectedAssignedRoles: string[] = [];
  selectedAvailableRoles: string[] = [];
  canBeBooked: boolean = false;

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

  private resetRoles(): void {
    this.assignedRoles = [];
    this.availableRoles = [...this.allRoles];
    this.selectedAssignedRoles = [];
    this.selectedAvailableRoles = [];
  }
  ngOnInit(): void {
    const initialAssigned = ['Projekte', 'Rolle 3', 'Zeiterfassung'];
    this.assignedRoles = this.allRoles.filter(role =>
      initialAssigned.includes(role.name)
    );
    this.availableRoles = this.allRoles.filter(role =>
      !initialAssigned.includes(role.name)
    );

    this.userForm.patchValue({
      username: 'paze',
      firstName: 'Patrick',
      lastName: 'Zessin',
      email: 'p.zessin@ws-nord.de',
      active: true,
    });
  }

  public editUser(user: any): void {
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

  public saveUser(): void {
    const formValue = this.userForm.value;
    const name = `${formValue.firstName} ${formValue.lastName}`;
    const updatedUser = {
      ...formValue,
      name,
      assignedRoles: this.assignedRoles.map(role => role.name),
    };

    this.userSaved.emit(updatedUser);
    this.userForm.reset({ active: true });
    this.resetRoles();
  }

}
