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
import { Column } from '../../../../../../Entities/column';
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

  cols: Column[] = [];
  selectedColumns: Column[] = [];
  userRolPreferences: UserPreference = {};
  tableKey: string = 'RolType'
  dataKeys = ['name'];

  @ViewChild('dt') dt!: Table;

  private langSubscription!: Subscription;

  readonly rolesData = computed(() => {
    return this.roleService.roles()
  });

  constructor(
    private readonly userPreferenceService: UserPreferenceService,
    private readonly roleStateService: RoleStateService,
    private readonly commonMessageService : CommonMessagesService,
    private readonly translate: TranslateService) { }

  ngOnInit() {
    this.roleUtils.loadInitialData().subscribe();
    this.updateHeadersAndColumns();
    this.userRolPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateHeadersAndColumns();
      this.userRolPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedRole = event.data;

      this.roleName = this.rolesData().find(role => role.id === this.selectedRole)?.name ?? '';
    }
    this.visibleModal = true;
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
        field: 'name',
        header: this.translate.instant(_('ROLES.TABLE_ROLES.USER_ROL')),
        useSameAsEdit: true
      }
    ];
  }

  ngOnDestroy(): void {
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

  onVisibleModal(visible: boolean) {
    this.visibleModal = visible;
  }

  /** handles message when trying to delete a role with a related entity */
  onConfirmDelete(message: { severity: string, summary: string, detail: string, relatedEntity?: string }): void {
    let finalDetail = this.translate.instant(_(message.detail));
    if (message.relatedEntity) {
      finalDetail = finalDetail + message.relatedEntity;
    }

    if (message.severity === 'success') {
      this.roleStateService.clearRole();
    }

    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: finalDetail,
    });
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedRole = null;
    }
  }

  editRole(role: Role) {
    this.roleStateService.setRoleToEdit(role);
  }

  onCreateRole(event: { status: 'success' | 'error' }): void {
    if ( event.status === 'success') {
      const sub = this.roleService.loadInitialData().subscribe();
      this.langSubscription.add(sub);
      this.prepareTableData();
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  private prepareTableData() {
    if (this.rolesData().length > 0) {
      this.selectedColumns = [
        { field: 'name', header: 'Roles' }
      ];
    }
  }
}
