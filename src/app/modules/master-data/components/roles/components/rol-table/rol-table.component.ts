import { Component, ViewChild, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { Role } from '../../../../../../Entities/role';
import { RoleService } from '../../../../../../Services/role.service';
import { MessageService } from 'primeng/api';
import { RoleUtils } from '../../utils/role-utils';
import { RoleStateService } from '../../utils/role-state.service';
import { RolModalComponent } from '../rol-modal/rol-modal.component';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-rol-table',
  standalone: false,
  templateUrl: './rol-table.component.html',
  styleUrl: './rol-table.component.scss'
})
export class RolTableComponent implements OnInit, OnDestroy {
  private readonly roleUtils = new RoleUtils();
  private readonly roleService = inject(RoleService);
  private readonly messageService = inject(MessageService);

  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedRole: number | null = null;
  roleName: string = '';
  @ViewChild('roleModal') rolModalComponent!: RolModalComponent;
  
  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if(event.type === 'delete' && event.data) {
      this.selectedRole = event.data;
      this.roleUtils.getRoleById(this.selectedRole!).subscribe({
        next: (role) => {
          this.roleName = role?.name ?? '';
        },
        error: (error) => {
          console.error('Error fetching role:', error);
          this.roleName = '';
        }
      });
    }
    this.visibleModal = true;
  }
  roleDatas: Role[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];
  userRolPreferences: UserPreference = {};
  tableKey: string = 'RolType'
  dataKeys = ['rol'];

  @ViewChild('dt') dt!: Table;

  private langSubscription!: Subscription;

  readonly rolesData = computed(()=>{
    return this.roleService.roles().map(role => ({
      id: role.id,
      role: role.name,
    }))
  });

  constructor(
              private readonly userPreferenceService: UserPreferenceService,
              private readonly roleStateService: RoleStateService,
              private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.roleUtils.loadInitialData().subscribe();
    this.updateHeadersAndColumns();
    this.userRolPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateHeadersAndColumns();
      this.userRolPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }


  onUserRolPreferencesChanges(userRolPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userRolPreferences));
  }

  updateHeadersAndColumns() {
    this.loadColumnHeaders();
    this.selectedColumns = [...this.cols];
  }

  loadColumnHeaders(): void {
    this.cols = [
      {
        field: 'role',
        minWidth: 110,
        header: this.translate.instant(_('ROLES.TABLE_ROLES.USER_ROL'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt.filter(inputElement.value, field, 'contains');
    }
  }

  onDialogShow() {
    if (this.modalType === 'create' && this.rolModalComponent) {
      this.rolModalComponent.focusInputIfNeeded();
    }
  }

  onVisibleModal(visible: boolean){
    this.visibleModal = visible;
  }

  onConfirmDelete(message: {severity: string, summary: string, detail: string}): void {
      this.messageService.add({
        severity: message.severity,
        summary: this.translate.instant(_(message.summary)),
        detail: this.translate.instant(_(message.detail)),
      });
    }
  
  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedRole = null;
    }
  }

  editRole(role: Role){
      const roleToEdit: Role = {
            id: role.id,
            name: role.name,
            createdAt: role.createdAt ?? '',
            updatedAt: role.updatedAt ?? '',
            version: role.version
          };
      
          this.roleUtils.getRoleById(roleToEdit.id).subscribe({
            next: (fullRole) => {
              if (fullRole) {
                this.roleStateService.setRoleToEdit(fullRole);
              }
            },
            error: (err) => {
              console.error('Error loading role:', err);
            }
          });
    }
}
