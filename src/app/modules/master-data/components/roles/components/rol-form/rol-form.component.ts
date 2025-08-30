import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Role } from '../../../../../../Entities/role';
import { Subscription } from 'rxjs';
import { RoleUtils } from '../../utils/role-utils';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { TranslateService } from "@ngx-translate/core";
import { RoleStateService } from '../../utils/role-state.service';

import { Rol } from '../../../../../../Entities/rol';
import { RolesService } from '../../services/roles.service';
import { SystemModule } from '../../../../../../Entities/systemModule';
import { SystemModuleService } from '../../../../../../Services/system-module.service';
import { Column } from '../../../../../../Entities/column';

@Component({
  selector: 'app-rol-form',
  standalone: false,
  templateUrl: './rol-form.component.html',
  styleUrl: './rol-form.component.scss'
})
export class RolFormComponent implements OnInit, OnDestroy{

  currentRole: Role | null = null;
  editRoleForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  public showOCCErrorModalRole = false;

  modules: SystemModule[] = [];

  selectedOrderCommission!: null;
  roles: Rol[] = [];

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  cols!: Column[];

  constructor( 
    private readonly rolService: RolesService,
    private readonly roleUtils: RoleUtils,
    private readonly roleStateService: RoleStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
    private readonly moduleService: SystemModuleService,
    private readonly fb: FormBuilder,
  ){ }

  ngOnInit(): void {
    this.initForm();
    this.setupRoleSubscription();
    // Check if we need to load a role after page refresh
    const savedRoleId = localStorage.getItem('selectedRoleId');
    if (savedRoleId) {
      this.loadRoleAfterRefresh(savedRoleId);
      localStorage.removeItem('selectedRoleId');
    }
    this.editRoleForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      selectedModule: new FormControl('')
    });

    this.roles = this.rolService.list();
    this.loadModules();
  }

  loadModules(): void {
    this.moduleService.getAllSystemModules().subscribe({
      next: (data) => {
        this.modules = data;
      },
      error: (err) => {
        console.error('Error loading modules', err);
      }
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
        
            this.isSaving = true;
            const updatedApprovalStatus: Role = {
              ...this.currentRole,
              name: this.editRoleForm.value.name
            };
            this.subscriptions.add(
              this.roleUtils.updateRole(updatedApprovalStatus).subscribe({
                next: () => this.handleSaveSuccess(),
                error: (err) => this.handleError(err)
              })
            );
  }

  private markAllAsTouched(): void {
    Object.values(this.editRoleForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private handleSaveSuccess(): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('MESSAGE.SUCCESS'),
      detail: this.translate.instant('MESSAGE.UPDATE_SUCCESS')
    });
    this.roleStateService.setRoleToEdit(null);
    this.clearForm();
  }

  private handleError(err: any): void {
    console.log(err)
    if (err.message === 'Version conflict: role has been updated by another user') {
      this.showOCCErrorModalRole = true;
    } else {
      this.handleSaveError(err);
    }
    this.isSaving = false;
  }

  private handleSaveError(error: any): void {
    console.error('Error saving approval status:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('MESSAGE.ERROR'),
      detail: this.translate.instant('MESSAGE.UPDATE_FAILED')
    });
    this.isSaving = false;
  }

  private initForm(): void {
    this.editRoleForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(2), Validators.maxLength(50)])
    });
  }

  private setupRoleSubscription(): void {
    this.subscriptions.add(
      this.roleStateService.currentRole$.subscribe(name => {
        this.currentRole = name;
        name ? this.loadApprovalStatusData(name) : this.clearForm();
      })
    );
  }

  private loadApprovalStatusData(role: Role): void {
        this.editRoleForm.patchValue({
          name: role.name
        });
      }
  clearForm(): void {
    this.editRoleForm.reset();
    this.currentRole = null;
    this.isSaving = false;
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
        }
      })
    );
  }

  onRefresh(): void {
    if (this.currentRole?.id) {
      localStorage.setItem('selectedRoleId', this.currentRole.id.toString());
      window.location.reload();
    }
  }
  
}
