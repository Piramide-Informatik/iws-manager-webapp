import { Component, ViewChild, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { SystemConstantUtils } from '../../utils/system-constant.utils';
import { SystemConstantService } from '../../../../../../Services/system-constant.service';
import { System } from '../../../../../../Entities/system';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-system-constant-table',
  standalone: false,
  templateUrl: './system-constant-table.component.html',
  styleUrl: './system-constant-table.component.scss'
})
export class SystemConstantTableComponent implements OnInit, OnDestroy {

  private readonly systemConstantUtils =  inject(SystemConstantUtils);
  private readonly systemConstantService = inject(SystemConstantService);
  systemConstantsColumns: any[] = [];
  isSystemConstantsChipVisible = false;
  userSystemConstantPreferences: UserPreference = {};
  tableKey: string = 'SystemConstant'
  dataKeys = ['name', 'value'];
  visibleSystemConstantModal = false;
  modalType: 'create' | 'delete' = 'create';
  selectedSystemConstant!: System | null;

  @ViewChild('dt') dt!: Table;

  readonly systemConstantsValues = computed(() => {
    return this.systemConstantService.systems().map(data => {
      let length = 0;
      if (data.valueChar) length = data.valueChar.length;
      return {
        id: data.id,
        name: data.name,
        value: length > 0 ? data.valueChar : data.valueNum
      }
    });
  });

  private langConstantsSubscription!: Subscription;

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService, 
              private readonly translate: TranslateService,
              private readonly commonMessageService: CommonMessagesService ) { }

  ngOnInit() {
    this.systemConstantUtils.loadInitialData().subscribe();
    this.loadHeadersAndColumns();
    this.userSystemConstantPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.systemConstantsColumns);
    this.langConstantsSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadHeadersAndColumns();
      this.userSystemConstantPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.systemConstantsColumns);
    });
  }

  onUserSystemConstantPreferencesChanges(userSystemConstantPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userSystemConstantPreferences));
  }

  loadHeadersAndColumns() {
    this.systemConstantsColumns = this.loadColumnSystemConstantHeaders();;
  }

  loadColumnSystemConstantHeaders(): any[] {
    return  [
      {
        field: 'name',
        minWidth: 110,
        header: this.translate.instant(_('SYSTEM_CONSTANT.TABLE_SYSTEM_CONSTANT.CONSTANT'))
      },
      {
        field: 'value',
        minWidth: 110,
        header: this.translate.instant(_('SYSTEM_CONSTANT.TABLE_SYSTEM_CONSTANT.VALUE'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langConstantsSubscription) {
      this.langConstantsSubscription.unsubscribe();
    }
  }

  onModalVisibilityChange(isVisible: boolean) {
    this.visibleSystemConstantModal = isVisible;
  }

  onCreateSystemConstant(event: {created?: System, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onDeleteSystemConstant(event: {status: 'success' | 'error', error?: Error}) {
    if(event.status === 'success'){
      this.commonMessageService.showDeleteSucessfullMessage();
    } else if(event.status === 'error'){
      event.error?.message === 'Cannot delete register: it is in use by other entities' ?
        this.commonMessageService.showErrorDeleteMessageUsedByOtherEntities() :
        this.commonMessageService.showErrorDeleteMessage();
    }
  }
  
  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete') {
      const foundSystemConstant = this.systemConstantService.systems().find(sc => sc.id == event.data);
      if (foundSystemConstant) {
        this.selectedSystemConstant = foundSystemConstant;
      }
    }
    this.visibleSystemConstantModal = true;
  }
}
