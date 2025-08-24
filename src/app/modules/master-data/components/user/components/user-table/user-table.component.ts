import { Component , ViewChild, inject, computed, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService, _ } from '@ngx-translate/core';
import { MasterDataService } from '../../../../master-data.service';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { UserService } from '../../../../../../Services/user.service';
import { UserUtils } from '../../utils/user-utils';
import { UserStateService } from '../../utils/user-state.service';
import { MessageService } from 'primeng/api';
import { UserModalComponent } from '../user-modal/user-modal.component';
import { User } from '../../../../../../Entities/user';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrl: './user-table.component.scss',
  standalone: false,
})
export class UserTableComponent {
  private readonly userUtils = new UserUtils();
  private readonly userService = inject(UserService);
  private readonly messageService =  inject(MessageService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedUser: number | null = null;
  UserName: string = '';
  @ViewChild('userModal') userModalComponent!: UserModalComponent;
  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedUser = event.data;

      this.userUtils.getUseryId(this.selectedUser!).subscribe({
        next: (user) => {
          this.UserName = user?.username ?? '';
        },
        error: (err) => {
          console.error('Could not get user:', err);
          this.UserName = '';
        }
      });
    }
    this.visibleModal = true;
  }


  readonly users = computed(() => {
    return this.userService.users().map(user => ({
      id: user.id,
      username: user.username,
      name: `${user.firstName} ${user.lastName}`,
      active: user.active
    }));
  });

  userColumns: any[] = [];
  userDisplayedColumns: any[] = [];
  userUserPreferences: UserPreference = {};
  tableKey: string = 'User'
  dataKeys = ['username', 'name', 'active'];

  
  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly userStateService: UserStateService
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
        { field: 'active', header: this.translate.instant(_('USERS.HEADER.ACTIVE')) }]
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
  onDialogShow() {
    if (this.modalType === 'create' && this.userModalComponent) {
      this.userModalComponent.focusInputIfNeeded();
    }
  }

  toastMessageDisplay(message: {severity: string, summary: string, detail: string}): void {
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    });
  }

  editUser(user: User) {
    
    const userToEdit: User = {
      id: user.id,
      username: user.username,
      password: user.password,
      active: user.active ?? true,
      email: user.email ?? '',
      firstName: user.firstName ?? '', 
      lastName: user.lastName ?? '',
      createdAt: '',
      updatedAt: '',
      version: 0
    };
    this.userUtils.getUseryId(userToEdit.id).subscribe({
      next: (fullUser) => {
        if(fullUser) {
          this.userStateService.setUserToEdit(fullUser);
        }
      },
      error: (err) => {
        console.error('Error Id user', err);
      }
    })
  }
}
