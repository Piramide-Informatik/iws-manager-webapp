import { Component, OnDestroy, OnChanges, OnInit, ViewChild, inject, computed, SimpleChanges } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { PublicHoliday } from '../../../../../../Entities/publicholiday';
import { PublicHolidayStateService } from '../../utils/public-holiday-state.service';
import { PublicHolidayUtils } from '../../utils/public-holiday-utils';
import { PublicHolidayService } from '../../../../../../Services/public-holiday.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Column } from '../../../../../../Entities/column';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
@Component({
  selector: 'app-holidays-table',
  standalone: false,
  templateUrl: './holidays-table.component.html',
  styleUrls: ['./holidays-table.component.scss'],
})
export class HolidaysTableComponent implements OnInit, OnDestroy, OnChanges {
  private readonly publicHolidayUtils = inject(PublicHolidayUtils);
  private readonly publicHolidayService = inject(PublicHolidayService);
  private readonly messageService = inject(MessageService);
  

  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedPublicHoliday: number | null = null;
  publicHolidayName: string = '';

  readonly publicHolidays = computed(() => {
    return this.publicHolidayService.publicHolidays();
  });

  columnsHeaderFieldHoliday: Column[] = [];
  publicHolidayDisplayedColumns: Column[] = [];
  userHolidaysPreferences: UserPreference = {};
  tableKey: string = 'Holidays';
  dataKeys = ['sequenceNo', 'name'];
  holidayData: PublicHoliday[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly publicHolidayStateService: PublicHolidayStateService,
    private readonly commonMessageService: CommonMessagesService
  ) {}

  ngOnInit(): void {
    this.loadHolidayData();
    this.loadHolidayHeadersAndColumns();
    this.userHolidaysPreferences =
      this.userPreferenceService.getUserPreferences(
        this.tableKey,
        this.publicHolidayDisplayedColumns
      );
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadHolidayHeadersAndColumns();
      this.userHolidaysPreferences =
        this.userPreferenceService.getUserPreferences(
          this.tableKey,
          this.publicHolidayDisplayedColumns
        );
    });
  }

  handleTableEvents(event: { type: 'create' | 'delete'; data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedPublicHoliday = event.data;

      this.publicHolidayName = this.publicHolidays().find(holiday => holiday.id === this.selectedPublicHoliday)?.name ?? '';
    }
    this.visibleModal = true;
  }

  loadHolidayData(): void {
    this.publicHolidayService.getAllPublicHolidays().subscribe({
      next: (data: PublicHoliday[]) => {
        this.holidayData = data;
      },
      error: (error) => {
        console.error('Error loading public holiday data:', error);
        this.holidayData = []; // Fallback to empty array
      },
    });
  }

  loadHolidayHeadersAndColumns() {
    this.loadColHeadersHoliday();
    this.publicHolidayDisplayedColumns = this.columnsHeaderFieldHoliday.filter(
      (col) => col != null
    );
  }

  onUserHolidaysPreferencesChanges(userHolidaysPreferences: any) {
    localStorage.setItem(
      'userPreferences',
      JSON.stringify(userHolidaysPreferences)
    );
  }

  loadColHeadersHoliday(): void {
    this.columnsHeaderFieldHoliday = [
      {
        field: 'sequenceNo',
        classesTHead: ['width-10'],
        useSameAsEdit: true,
        header: this.translate.instant(_('HOLIDAYS.TABLE.SORT')),
        customClasses: ['align-right'],
        filter: { type: 'numeric'}
      },
      {
        field: 'name',
        useSameAsEdit: true,
        header: this.translate.instant(_('HOLIDAYS.TABLE.NAME')),
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['publicHolidays']) {
      this.prepareTableData();
    }
  }
  private prepareTableData() {
    if (this.publicHolidays().length > 0) {
      this.publicHolidayDisplayedColumns = [
        { field: 'name', header: 'PublicHoliday' },
        { field: 'sort', header: 'Sort' },
      ];
    }
  }

  private showToast(message: {
    severity: string;
    summary: string;
    detail: string;
  }): void {
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    });
  }

  toastMessageDisplay(message: {
    severity: string;
    summary: string;
    detail: string;
  }): void {
      this.commonMessageService.showCustomSeverityAndMessage(
      message.severity,
      message.summary,
      message.detail
    )
  }


  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedPublicHoliday = null;
    }
  }
  onDeleteConfirm(message: {
    severity: string;
    summary: string;
    detail: string;
  }): void {
      this.showToast(message);
  }

  editPublicHoliday(publicHoliday: PublicHoliday) {
    this.publicHolidayStateService.setPublicHolidayToEdit(publicHoliday);
  }

  createdHoliday(){
    this.publicHolidayUtils.loadInitialData().subscribe()
  }
}
