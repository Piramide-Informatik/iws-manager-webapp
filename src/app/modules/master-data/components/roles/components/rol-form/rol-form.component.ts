import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Role } from '../../../../../../Entities/role';
import { Subscription, forkJoin, of } from 'rxjs';
import { RoleUtils } from '../../utils/role-utils';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { RoleStateService } from '../../utils/role-state.service';

import { Rol } from '../../../../../../Entities/rol';
import { SystemModule } from '../../../../../../Entities/systemModule';
import { ModuleUtils } from '../../utils/system-module-utils';
import { SystemFunctionWithRights } from '../../../../../../Entities/systemFunctionWithRights';
import { FunctionUtils } from '../../utils/system-function-utils';
import { Column } from '../../../../../../Entities/column';
import { RightRoleUtils } from '../../utils/right-role-utils';
import { RightRole } from '../../../../../../Entities/rightRole';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
@Component({
  selector: 'app-rol-form',
  standalone: false,
  templateUrl: './rol-form.component.html',
  styleUrl: './rol-form.component.scss',
})
export class RolFormComponent implements OnInit, OnDestroy {
  currentRole: Role | null = null;
  editRoleForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  public showOCCErrorModalRole = false;
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  modules: SystemModule[] = [];
  existingRights: RightRole[] = [];
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public nameAlreadyExist = false;

  selectedOrderCommission!: null;
  roles: Rol[] = [];
  functions: SystemFunctionWithRights[] = [];

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  cols!: Column[];

  constructor(
    private readonly roleUtils: RoleUtils,
    private readonly roleStateService: RoleStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
    private readonly moduleUtils: ModuleUtils,
    private readonly functionUtils: FunctionUtils,
    private readonly fb: FormBuilder,
    private readonly rightRoleUtils: RightRoleUtils,
    private readonly commonMessagesService: CommonMessagesService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupRoleSubscription();
    // Check if we need to load a role after page refresh
    const savedRoleId = localStorage.getItem('selectedRoleId');
    if (savedRoleId) {
      this.loadRoleAfterRefresh(savedRoleId);
      localStorage.removeItem('selectedRoleId');
    }

    this.loadModules();
  }

  loadModules(): void {
    this.moduleUtils.getAllSystemModules().subscribe({
      next: (data) => {
        this.modules = data;
      },
      error: (err) => {
        console.error('Error loading modules', err);
      },
    });
  }

  onModuleChange(moduleId: number): void {
    if (!moduleId || !this.currentRole?.id) {
      this.functions = [];
      return;
    }

    forkJoin({
      functions: this.functionUtils.getFunctionsByModuleId(moduleId),
      rights: this.rightRoleUtils.getRightRolesByModuleId(
        moduleId,
        this.currentRole.id
      ),
    }).subscribe({
      next: ({ functions, rights }) => {
        this.existingRights = rights;

        this.functions = functions.map((fn) => {
          // Find the RightRole associated with this function
          const rr = rights.find((r) => r.systemFunction?.id === fn.id);
          const rightsValue = rr?.accessRight ?? 0;

          return {
            ...fn,
            read: (rightsValue & 1) !== 0,
            insert: (rightsValue & 2) !== 0,
            modify: (rightsValue & 4) !== 0,
            delete: (rightsValue & 8) !== 0,
            execute: (rightsValue & 16) !== 0,
          } as SystemFunctionWithRights;
        })
        .sort((a, b) => (a.sequenceNo || 0) - (b.sequenceNo || 0));
      },
      error: (err) => {
        console.error('Error loading RightRoles or Functions:', err);
        this.functions = [];
      },
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.editRoleForm.invalid || !this.currentRole || this.isSaving) {
    this.markAllAsTouched();
    return;
  }

  const newName = this.editRoleForm.value.name?.trim();
  if (!newName) return;

  this.isSaving = true;

  // Check if another role with the same name already exists
  this.roleUtils.roleExists(newName).subscribe({
    next: (exists) => {
      if (exists && newName !== this.currentRole!.name) {
        // Only show error if the name belongs to ANOTHER role
        this.commonMessagesService.showErrorRecordAlreadyExist();
        this.nameAlreadyExist = true;
        this.isSaving = false;
        return;
      }

      // Continue with the update
      const updatedRole: Role = {
        ...this.currentRole!,
        id: this.currentRole!.id,
        name: newName,
      };

      this.subscriptions.add(
        this.roleUtils.updateRole(updatedRole).subscribe({
          next: (savedRole) => {
            this.currentRole = savedRole;
            this.saveRights(savedRole);
            this.commonMessagesService.showEditSucessfullMessage();
            this.isSaving = false;
          },
          error: (err) => this.handleError(err),
        })
      );
    },
    error: (err) => {
      console.error('Error checking role existence:', err);
      this.isSaving = false;
    },
  });
  }

  private markAllAsTouched(): void {
    Object.values(this.editRoleForm.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private handleSaveSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('MESSAGE.SUCCESS'),
      detail: this.translate.instant('MESSAGE.UPDATE_SUCCESS'),
    });
    // Keep the selected role
    // Only clear modules and functions
    this.editRoleForm.patchValue({ selectedModule: null });
    this.functions = [];
    this.existingRights = [];
    this.isSaving = false;
    this.editRoleForm.markAsPristine();
  }

  private handleError(err: any): void {
    if (err instanceof OccError) {
      this.commonMessagesService.showErrorEditMessage();
      this.showOCCErrorModalRole = true;
      this.occErrorType = err.errorType;
    } else {
      this.handleSaveError(err);
    }
    this.isSaving = false;
  }

  private handleSaveError(error: any): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('MESSAGE.ERROR'),
      detail: this.translate.instant('MESSAGE.UPDATE_FAILED'),
    });
    this.isSaving = false;
  }

  private initForm(): void {
    this.editRoleForm = new FormGroup({
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
      ]),
      selectedModule: new FormControl('')
    });
  }

  private setupRoleSubscription(): void {
    this.subscriptions.add(
      this.roleStateService.currentRole$.subscribe((name) => {
        this.currentRole = name;
        name ? this.loadRolesData(name) : this.clearForm();
      })
    );
  }

  private loadRolesData(role: Role): void {
    this.editRoleForm.patchValue({
      name: role.name,
      selectedModule: null, // deselect the module when changing roles
    });
    this.functions = []; // deselect the module when changing roles
    this.existingRights = [];
    this.focusInputIfNeeded();
  }
  clearForm(): void {
    this.editRoleForm.reset();
    this.currentRole = null;
    this.isSaving = false;
    this.nameAlreadyExist = false;
    this.functions = [];
    this.existingRights = [];
  }

  private loadRoleAfterRefresh(roleId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.roleUtils.getRoleById(Number(roleId)).subscribe({
        next: (name) => {
          if (name) {
            this.roleStateService.setRoleToEdit(name);
          }
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        },
      })
    );
  }

  onRefresh(): void {
    if (this.currentRole?.id) {
      localStorage.setItem('selectedRoleId', this.currentRole.id.toString());
      window.location.reload();
    }
  }

  saveRights(role: Role): void {
    if (!role?.id) {
      console.error('No role selected');
      return;
    }
    this.isSaving = true;

    const toSave: RightRole[] = [];
    const toUpdate: RightRole[] = [];

    // Procesar las funciones actuales
    this.functions.forEach((fn) => {
      const accessRight = this.calculateAccessRight(fn);
      const current = this.existingRights.find(
        (r) => r.systemFunction.id === fn.id
      );

      if (current) {
        // Actualizamos incluso si accessRight = 0
        if (current.accessRight !== accessRight) {
          toUpdate.push({ ...current, accessRight });
        }
      } else {
        // Crear nuevo derecho incluso si accessRight = 0
        toSave.push({
          accessRight,
          role: { id: role.id },
          systemFunction: { id: fn.id },
        } as RightRole);
      }
    });

    // Procesar derechos existentes que ya no están en la lista de funciones
    const functionIds = new Set(this.functions.map((fn) => fn.id));
    this.existingRights.forEach((existingRight) => {
      if (!functionIds.has(existingRight.systemFunction.id)) {
        // Esta función ya no está en la lista, crear nuevo con accessRight = 0
        toSave.push({
          accessRight: 0,
          role: { id: role.id },
          systemFunction: { id: existingRight.systemFunction.id },
        } as RightRole);
      }
    });

    const requests = [
      ...toSave.map((r) => this.rightRoleUtils.addRightRole(r)),
      ...toUpdate.map((r) => this.rightRoleUtils.updateRightRole(r)),
    ];

    forkJoin({
      save: requests.length ? forkJoin(requests) : of(null),
    }).subscribe({
      next: () => {
        this.handleSaveSuccess();
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Error saving rights:', err);
        this.handleError(err);
        this.isSaving = false;
      },
    });
  }
  onCancel(): void {
    this.editRoleForm.patchValue({ selectedModule: null });
    this.functions = [];
    this.existingRights = [];
    this.clearForm();
  }

  private calculateAccessRight(fn: SystemFunctionWithRights): number {
    let value = 0;
    if (fn.read) value |= 1;
    if (fn.insert) value |= 2;
    if (fn.modify) value |= 4;
    if (fn.delete) value |= 8;
    if (fn.execute) value |= 16;
    return value;
  }

  private focusInputIfNeeded(): void {
    if (this.currentRole && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
