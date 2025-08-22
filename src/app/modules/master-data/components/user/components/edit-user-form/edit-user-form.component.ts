import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../../../../Entities/user';
import { BehaviorSubject, forkJoin, Observable, Subscription, switchMap } from 'rxjs';
import { UserStateService } from '../../utils/user-state.service';
import { UserUtils } from '../../utils/user-utils';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Role } from '../../../../../../Entities/role';
import { RoleService } from '../../../../../../Services/role.service';

@Component({
  selector: 'app-edit-user-form',
  templateUrl: './edit-user-form.component.html',
  styleUrls: ['./edit-user-form.component.scss'],
  standalone: false,
})
export class EditUserFormComponent implements OnInit {
  public showOCCErrorModaUser = false;
  currentUser: User | null = null;
  editUserForm!: FormGroup;
  //userForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  private readonly editUserSource = new BehaviorSubject<User | null>(null);
  private readonly roleService = inject(RoleService);

  allRoles: Role [] = [];

  userRoles: Role[] = [];

  availableRoless: Role[] = [];

  selectedAssignedRoles: string[] = [];
  selectedAvailableRoles: string[] = [];
  canBeBooked: boolean = false;

  constructor(
    private readonly userUtils: UserUtils,
    private readonly userStateService: UserStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
  ) {}

  ngOnInit(): void {

    this.initForm();
    this.setupUserSubscription();
    const savedProjectStatusId = localStorage.getItem('selectedUserId');
    if (savedProjectStatusId){
      this.loadTitleAfterRefresh(savedProjectStatusId);
      localStorage.removeItem('selectedUserId');
    }
  }
  
  private initForm(): void {
    this.editUserForm = new FormGroup({
      username: new FormControl(''),
      nameUser: new FormControl(''),
      firstName: new FormControl('' ),
      lastName: new FormControl('' ),
      email: new FormControl('', [Validators.email]),
      password: new FormControl(''),
      active: new FormControl(true),
      role: new FormControl([]),
    });
  }

  onRolesChange(): void {
  this.editUserForm.get('role')?.setValue(this.userRoles);
  this.editUserForm.get('role')?.markAsDirty();
}

  private setupUserSubscription(): void {
    this.subscriptions.add(
      this.userStateService.currentUser$.subscribe(user => {
        this.currentUser = user;
        user ? this.loadUserData(user) : this.clearForm();
      })
    );
  }

  private loadUserData(user: User): void {
  this.editUserForm.patchValue({
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: '',
    active: user.active,
    role: user.roles || []
  });

  const roles$: Observable<{ allRoles: Role[]; userRoles: Role[] }> = forkJoin({
    allRoles: this.roleService.getAllRoles(),
    userRoles: this.userUtils.getRolesByUser(user.id)
  });

  this.addSubscription(
    roles$,
    (result: { allRoles: Role[]; userRoles: Role[] }) => {
      let { allRoles, userRoles } = result;

      //Sort list of “Available roles” and “Assigned roles” in Users view
      allRoles = allRoles.sort((a, b) => a.name.localeCompare(b.name));
      userRoles = userRoles.sort((a, b) => a.name.localeCompare(b.name));

      this.allRoles = allRoles;
      this.userRoles = userRoles;

      this.availableRoless = allRoles.filter((role: Role) =>
        !userRoles.some((ur: Role) => ur.id === role.id)
      );
    }
  );
}


  private loadTitleAfterRefresh(userId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.userUtils.getUseryId(Number(userId)).subscribe({
        next: (user) => {
          if (user) {
            this.userStateService.setUserToEdit(user);
          }
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      })
    );
  }

  clearForm(): void {
      this.editUserForm.reset();
      this.currentUser = null;
      this.isSaving = false;
      this.availableRoless = [];
      this.userRoles = [];
    }

    onSubmit(): void {
      console.log(this.userRoles)
      if (this.shouldAbortSubmission()) {
        this.markAllAsTouched();
        return;
        
      }
      this.isSaving = true;
      const updatedUser = this.createUpdatedUser();
  
      this.updateUserData(updatedUser);
    }

  private shouldAbortSubmission(): boolean {
    return this.editUserForm.invalid || !this.currentUser || this.isSaving;
  }

  private createUpdatedUser(): User {
  return {
    ...this.currentUser!,
    username: this.editUserForm.value.username,
    firstName: this.editUserForm.value.firstName,
    lastName: this.editUserForm.value.lastName,
    email: this.editUserForm.value.email,
    active: this.editUserForm.value.active,
    roles: this.editUserForm.value.role || []
    };
  }

  private updateUserData(user: User): void {
    this.addSubscription(
      this.userUtils.updateUsers(user).pipe(
        switchMap((savedUser: User) => {
        const roleIds = this.userRoles.map(role => role.id);
        return this.userUtils.assignRole(savedUser.id, roleIds);
    })
      ),
      (savedUser) => this.handleSaveSuccess(savedUser)
    );
  }

  private assignUserRoles(user: User): void {
  const roleIds = this.userRoles.map(role => role.id);
  this.addSubscription(
    this.userUtils.assignRole(user.id, roleIds),
    (savedUser) => this.handleSaveSuccess(savedUser)
  );
}

  private addSubscription(observable: Observable<any>, nextHandler: (value: any) => void): void {
    this.subscriptions.add(
      observable.subscribe({
        next: nextHandler,
        error: (err) => this.handleError(err)
      })
    );
  }

    private markAllAsTouched(): void {
    Object.values(this.editUserForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private handleError(err: any): void {
      if (err.message === 'Version conflict: User has been updated by another user') {
        console.log(" show OCC error modal");
        this.showOCCErrorModaUser = true;
      } else {
        this.handleSaveError(err);
      }
      this.isSaving = false;
    }
  
  private handleSaveSuccess(savedUser: User): void {
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('MESSAGE.SUCCESS'),
        detail: this.translate.instant('MESSAGE.UPDATE_SUCCESS')
      });
      this.userStateService.setUserToEdit(null);
      this.clearForm();
    }
  
  private handleSaveError(error: any): void {
      console.error('Error saving user:', error);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('MESSAGE.UPDATE_FAILED')
      });
      this.isSaving = false;
    }

  setUserToEdit(user: User | null) {
    this.editUserSource.next(user);
  }

  onRefresh(): void {
    if (this.currentUser?.id) {
      localStorage.setItem('selectedUserId', this.currentUser.id.toString());
      window.location.reload();
    }
  }
}
