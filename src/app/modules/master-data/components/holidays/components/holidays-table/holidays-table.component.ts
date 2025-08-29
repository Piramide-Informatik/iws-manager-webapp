import {
  Component,
  OnDestroy,
  OnChanges,
  OnInit,
  ViewChild,
  inject,
  computed,
  SimpleChanges,
} from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { MasterDataService } from '../../../../master-data.service';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { PublicHoliday } from '../../../../../../Entities/publicholiday';
import { PublicHolidayStateService } from '../../utils/public-holiday-state.service';
import { PublicHolidayUtils } from '../../utils/public-holiday-utils';
import { PublicHolidayService } from '../../../../../../Services/public-holiday.service';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { HolidayModalComponent } from '../holiday-modal/holiday-modal.component';

@Component({
  selector: 'app-holidays-table',
  standalone: false,
  templateUrl: './holidays-table.component.html',
  styleUrls: ['./holidays-table.component.scss'],
})
export class HolidaysTableComponent implements OnInit, OnDestroy, OnChanges {
  private readonly publicHolidayUtils = new PublicHolidayUtils();
  private readonly publicHolidayService = inject(PublicHolidayService);
  private readonly messageService = inject(MessageService);

  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedPublicHoliday: number | null = null;
  publicHolidayName: string = '';
  @ViewChild('HolidayModel')
  publicHolidayModelComponent!: HolidayModalComponent;

  handleTableEvents(event: { type: 'create' | 'delete'; data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedPublicHoliday = event.data;
      this.publicHolidayUtils
        .getPublicHolidayById(this.selectedPublicHoliday!)
        .subscribe({
          next: (publicHoliday) => {
            this.publicHolidayName = publicHoliday?.name ?? '';
          },
          error: (error) => {
            console.error('Error fetching publicHoliday:', error);
            this.publicHolidayName = '';
          },
        });
    }
    this.visibleModal = true;
  }

  readonly publicHolidays = computed(() => {
    return this.publicHolidayService.publicHolidays().map((publicHoliday) => ({
      id: publicHoliday.id,
      sort: publicHoliday.sequenceNo,
      name: publicHoliday.name,
    }));
  });

  holidays: any[] = [];
  columnsHeaderFieldHoliday: any[] = [];
  publicHolidayDisplayedColumns: any[] = [];
  userHolidaysPreferences: UserPreference = {};
  tableKey: string = 'Holidays';
  dataKeys = ['sort', 'name'];
  holidayData: PublicHoliday[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly publicHolidayStateService: PublicHolidayStateService
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
        field: 'sort',
        styles: { width: '100px' },
        header: this.translate.instant(_('HOLIDAYS.TABLE.SORT')),
        customClasses: ['align-right'],
      },
      {
        field: 'name',
        styles: { width: 'auto' },
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
      this.showToast(message);
  }

  onDialogShow() {
    if (this.modalType === 'create' && this.publicHolidayModelComponent) {
      this.publicHolidayModelComponent.focusInputIfNeeded();
    }
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
    const publicHolidayToEdit: PublicHoliday = {
      id: publicHoliday.id,
      name: publicHoliday.name,
      sequenceNo: publicHoliday.sequenceNo,
      isFixedDate: publicHoliday.isFixedDate,
      date: publicHoliday.date,
      createdAt: '',
      updatedAt: '',
      version: 0,
    };
    this.publicHolidayUtils
      .getPublicHolidayById(publicHolidayToEdit.id)
      .subscribe({
        next: (fullPublicHoliday) => {
          if (fullPublicHoliday) {
            this.publicHolidayStateService.setPublicHolidayToEdit(
              fullPublicHoliday
            );
          }
        },
        error: (err) => {
          console.error('Error Id PublicHoliday', err);
        },
      });
  }
}
