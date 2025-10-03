import { Component , ViewChild, inject, computed, SimpleChanges, OnInit, OnDestroy, OnChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { UserService } from '../../../../../../Services/user.service';
import { UserUtils } from '../../utils/user-utils';
import { UserStateService } from '../../utils/user-state.service';
import { MessageService } from 'primeng/api';
import { User } from '../../../../../../Entities/user';
import { Column } from '../../../../../../Entities/column';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
  standalone: false,
})
export class UserTableComponent implements OnInit, OnDestroy, OnChanges {
  private readonly userUtils = new UserUtils();
  private readonly userService = inject(UserService);
  private readonly messageService =  inject(MessageService);
  private readonly usersMap: Map<number, User> = new Map();
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedUser: number | null = null;
  UserName: string = '';

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedUser = event.data;

      this.UserName = this.users().find(user => user.id === this.selectedUser)?.username ?? '';
    }
    this.visibleModal = true;
  }


  readonly users = computed(() => {
    return this.userService.users().map(user => {
      this.usersMap.set(user.id, user);
      return {
        id: user.id,
        username: user.username,
        name: `${user.firstName} ${user.lastName}`,
        active: user.active
      }
    });
  });

  userColumns: Column[] = [];
  userDisplayedColumns: Column[] = [];
  userUserPreferences: UserPreference = {};
  tableKey: string = 'User'
  dataKeys = ['username', 'name', 'active'];

  
  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly userStateService: UserStateService,
    private readonly commonMessageService: CommonMessagesService
  ) {}

  ngOnInit() {
    this.loadUserHeadersAndColumns();
    this.userUserPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.userDisplayedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadUserHeadersAndColumns();
      this.userUserPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.userDisplayedColumns);
    });
  }
  onUserPreferencesChanges(userPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }

  loadUserHeadersAndColumns() {
    this.loadUserHeaders();
    this.userDisplayedColumns = this.userColumns.filter(col => col.field !== 'label');
  }

  loadUserHeaders(): void {
    this.userColumns = [
      {
        field: 'username',
        minWidth: 110,
        header: this.translate.instant(_('USERS.HEADER.USERNAME')),
        useSameAsEdit: true
      },
      {
        field: 'name',
        minWidth: 110,
        header: this.translate.instant(_('USERS.HEADER.NAME')),
      },
      {
        field: 'active',
        minWidth: 110,
        header: this.translate.instant(_('USERS.HEADER.ACTIVE')),
        filter: { type: 'boolean' }
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['users']) {
      this.prepareTableData();
    }
  }

  private prepareTableData() {
    if (this.users().length > 0) {
      this.userDisplayedColumns = [
        { field: 'username', header: this.translate.instant(_('USERS.HEADER.USERNAME')) },
        { field: 'name', header: this.translate.instant(_('USERS.HEADER.NAME')) },
        { field: 'active', header: this.translate.instant(_('USERS.HEADER.ACTIVE')), filter: { type: 'boolean' }  }]
    }
  }

  applyUserFilter(event: any, field: string) {
    const inputTitleFilterElement = event.target as HTMLInputElement;
    if (inputTitleFilterElement) {
      this.dt2.filter(inputTitleFilterElement.value, field, 'contains');
    }
  }

  onVisibleModal(visible: boolean) {
    this.visibleModal = visible;
  }
  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedUser = null;
    }
  }

  toastMessageDisplay(message: {severity: string, summary: string, detail: string}): void {
    this.commonMessageService.showCustomSeverityAndMessage(message.severity, message.summary, message.detail);
  }

  editUser(user: { id: number, username: string, name: string, active: boolean }) {
    const userToEdit = this.usersMap.get(user.id) ?? null;
    this.userStateService.setUserToEdit(userToEdit);
  }
}
