import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../../../../../Entities/user';
import { BehaviorSubject, Subscription } from 'rxjs';
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


  // @Output() userSaved = new EventEmitter<any>();

  
  // allRoles: { name: string }[] = [
  //   { name: 'Projekte' },
  //   { name: 'Rolle 3' },
  //   { name: 'Zeiterfassung' },
  //   { name: 'Administrator' },
  //   { name: 'Finanzen' }
  // ];
  allRoles: Role [] = []; //****/

  userRoles: Role[] = [];

  availableRoless: Role[] = [];
  userId: number = 1; // ejemplo

  // assignedRoles: { name: string }[] = [];
  // availableRoles: { name: string }[] = [];

  selectedAssignedRoles: string[] = [];
  selectedAvailableRoles: string[] = [];
  canBeBooked: boolean = false;

  constructor(
    private readonly userUtils: UserUtils,
    private readonly userStateService: UserStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
  ) {
    // this.userForm = this.fb.group({
    //   username: [''],
    //   firstName: [''],
    //   lastName: [''],
    //   email: [''],
    //   password: [''],
    //   active: [true],
    // });

    // this.resetRoles();
  }

  ngOnInit(): void {

    //this.userUtils.getRolesByUser(this.userId).subscribe(data => this.userRoles = data);

    this.initForm();
    this.setupUserSubscription();
    const savedProjectStatusId = localStorage.getItem('selectedUserId');
    if (savedProjectStatusId){
      this.loadTitleAfterRefresh(savedProjectStatusId);
      localStorage.removeItem('selectedUserId');
    }

    // const initialAssigned = ['Projekte', 'Rolle 3', 'Zeiterfassung'];
    // this.assignedRoles = this.allRoles.filter(role =>
    //   initialAssigned.includes(role.name)
    // );
    // this.availableRoles = this.allRoles.filter(role =>
    //   !initialAssigned.includes(role.name)
    // );

    // this.userForm.patchValue({
    //   username: 'paze',
    //   firstName: 'Patrick',
    //   lastName: 'Zessin',
    //   email: 'p.zessin@ws-nord.de',
    //   active: true,
    // });
  }
  
  private initForm(): void {
    this.editUserForm = new FormGroup({
      username: new FormControl('', Validators.required),
      nameUser: new FormControl(''),
      firstName: new FormControl('' ),
      lastName: new FormControl('' ),
      email: new FormControl('', Validators.email ),
      password: new FormControl(''),
      active: new FormControl(true),
      role: new FormControl([]),
    });
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
        password: 'test',
        active: user.active
      });
      this.roleService.getAllRoles().subscribe(allRoles => {
      this.allRoles = allRoles;

      this.userUtils.getRolesByUser(user.id).subscribe(userRoles =>{
        this.userRoles = userRoles

        this.availableRoless = this.allRoles.filter(
          role => !userRoles.some(ur => ur.id === role.id)
        );
      });
    });
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
    }

    onSubmit(): void {
      console.log(this.userRoles)
      if (this.editUserForm.invalid || !this.currentUser || this.isSaving) {
        this.markAllAsTouched();
        return;
        
      }
      this.isSaving = true;
      const updatedUser: User = {
        ...this.currentUser,
        username: this.editUserForm.value.username,
        firstName: this.editUserForm.value.firstName,
        lastName: this.editUserForm.value.lastName,
        email: this.editUserForm.value.email,
        active: this.editUserForm.value.active,
        roles: this.userRoles
      };
  
      this.subscriptions.add(
        this.userUtils.updateUsers(updatedUser).subscribe({
          next: (savedUser) => this.handleSaveSuccess(savedUser),
          error: (err) => this.handleError(err)
        })
      );
      this.subscriptions.add(
        this.userUtils.assignRole(updatedUser.id,this.userRoles.map(
          role => role.id)).subscribe({
            next: (savedUser) => this.handleSaveSuccess(savedUser),
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
        this.showOCCErrorModaUser = true;
      } else {
        this.handleSaveError(err);
      }
      this.isSaving = false;
    }
  
  private handleSaveSuccess(savedUser: User): void {
      this.messageService.add({
        severity: 'success',
        summary: this.translate.instant('TITLE.MESSAGE.SUCCESS'),
        detail: this.translate.instant('TITLE.MESSAGE.UPDATE_SUCCESS')
      });
      this.userStateService.setUserToEdit(null);
      this.clearForm();
    }
  
  private handleSaveError(error: any): void {
      console.error('Error saving title:', error);
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('TITLE.MESSAGE.ERROR'),
        detail: this.translate.instant('TITLE.MESSAGE.UPDATE_FAILED')
      });
      this.isSaving = false;
    }

  // private resetRoles(): void {
  //   //this.assignedRoles = [];
  //   //this.availableRoles = [...this.allRoles];
  //   this.selectedAssignedRoles = [];
  //   this.selectedAvailableRoles = [];
  // }
  
  
  // ngOnDestroy(): void {
  //   this.subscriptions.unsubscribe();
  // }

  setUserToEdit(user: User | null) {
    this.editUserSource.next(user);
  }

  // public editUser(user: any): void {
  //   this.editUserForm.patchValue({
  //     username: user.username,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     email: user.email,
  //     password: '',
  //     active: user.active,
  //   });

  //   this.assignedRoles = user.assignedRoles ?? [];
  //   this.availableRoles = this.allRoles.filter(
  //     (role) => !this.assignedRoles.includes(role)
  //   );
  // }

  // public saveUser(): void {
  //   const formValue = this.editUserForm.value;
  //   const name = `${formValue.firstName} ${formValue.lastName}`;
  //   const updatedUser = {
  //     ...formValue,
  //     name,
  //     assignedRoles: this.assignedRoles.map(role => role.name),
  //   };

  //   // this.userSaved.emit(updatedUser);
  //   this.editUserForm.reset({ active: true });
  //   this.resetRoles();
  // }
  
  onRefresh(): void {
    if (this.currentUser?.id) {
      localStorage.setItem('selectedUserId', this.currentUser.id.toString());
      window.location.reload();
    }
  }
}
