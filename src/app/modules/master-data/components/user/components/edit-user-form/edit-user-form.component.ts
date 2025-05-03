import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-user-form',
  templateUrl: './edit-user-form.component.html',
  styleUrls: ['./edit-user-form.component.scss'],
  standalone: false,
})
export class EditUserFormComponent {
  @Input() allRoles: string[] = [
    'Projekte',
    'Rolle 3',
    'Zeiterfassung',
    'Administrator',
    'Finanzen',
  ];

  @Output() userSaved = new EventEmitter<any>();

  userForm: FormGroup;
  assignedRoles: string[] = [];
  availableRoles: string[] = [];

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
    this.userForm.patchValue({
      username: 'paze',
      firstName: 'Patrick',
      lastName: 'Zessin',
      email: 'p.zessin@ws-nord.de',
      active: true,
    });

    this.assignedRoles = ['Projekte', 'Rolle 3', 'Zeiterfassung'];
    this.availableRoles = ['Administrator', 'Finanzen'];
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
      assignedRoles: [...this.assignedRoles],
    };

    this.userSaved.emit(updatedUser);

    this.userForm.reset({ active: true });
    this.resetRoles();
  }

  private transferRoles(
    from: string[],
    to: string[],
    selected: string[]
  ): string[] {
    selected.forEach((role) => {
      if (!to.includes(role)) to.push(role);
    });
    from = from.filter((role) => !selected.includes(role));
    selected.length = 0;
    return from;
  }

  public moveToAssigned(): void {
    this.availableRoles = this.transferRoles(
      this.availableRoles,
      this.assignedRoles,
      this.selectedAvailableRoles
    );
  }

  public moveAllToAssigned(): void {
    this.assignedRoles.push(
      ...this.availableRoles.filter((r) => !this.assignedRoles.includes(r))
    );
    this.availableRoles = [];
    this.selectedAvailableRoles = [];
  }

  public moveToAvailable(): void {
    this.assignedRoles = this.transferRoles(
      this.assignedRoles,
      this.availableRoles,
      this.selectedAssignedRoles
    );
  }

  public moveAllToAvailable(): void {
    this.availableRoles.push(
      ...this.assignedRoles.filter((r) => !this.availableRoles.includes(r))
    );
    this.assignedRoles = [];
    this.selectedAssignedRoles = [];
  }
}
