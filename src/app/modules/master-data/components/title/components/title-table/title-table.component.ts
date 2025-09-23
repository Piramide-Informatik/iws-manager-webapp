import { Component, ViewChild, OnInit, OnDestroy, inject, computed, SimpleChanges, OnChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { TitleService } from '../../../../../../Services/title.service';
import { TitleUtils } from '../../utils/title-utils';
import { Title } from '../../../../../../Entities/title';
import { TitleStateService } from '../../utils/title-state.service';
import { TitleModalComponent } from '../title-modal/title-modal.component';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-title-table',
  standalone: false,
  templateUrl: './title-table.component.html',
  styleUrl: './title-table.component.scss'
})
export class TitleTableComponent implements OnInit, OnDestroy, OnChanges {
  private readonly titleUtils = new TitleUtils();
  private readonly titleService = inject(TitleService);
  private readonly messageService = inject(MessageService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedTitle: number | null = null;
  titleName: string = '';
  @ViewChild('titleModal') titleModalComponent!: TitleModalComponent;
  // handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
  //   this.modalType = event.type;
  //   if (event.type === 'delete' && event.data) {
  //     this.selectedTitle = event.data;

  //     this.titleUtils.getTitleById(this.selectedTitle!).subscribe({
  //       next: (title) => {
  //         this.titleName = title?.name ?? '';
  //       },
  //       error: (err) => {
  //         console.error('No se pudo obtener el título:', err);
  //         this.titleName = '';
  //       }
  //     });
  //   }
  //   this.visibleModal = true;
  // }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;

    if (event.type === 'delete' && event.data) {
      const id = event.data.id ?? event.data;
      const titleObj = this.titleService.titles().find(t => t.id === id);
      if (titleObj) {
        this.selectedTitle = titleObj.id;
        this.titleName = titleObj.name;
      } else {
        this.selectedTitle = id;
        this.titleName = event.data.title ?? '';
      }
    }

    this.visibleModal = true;
  }


  readonly titles = computed(() => {
    return this.titleService.titles().map(title => ({
      id: title.id,
      title: title.name,
    }));
  });

  titleColumns: any[] = [];
  titleDisplayedColumns: any[] = [];
  isChipsVisible = false;
  userTitlePreferences: UserPreference = {};
  tableKey: string = 'Title'
  dataKeys = ['label', 'title'];

  @ViewChild('dt2') dt2!: Table;

  private langTitleSubscription!: Subscription;

  constructor(private readonly userPreferenceService: UserPreferenceService,
    private readonly translate: TranslateService, private readonly titleStateService: TitleStateService) { }

  ngOnInit() {
    this.loadTitleHeadersAndColumns();
    this.userTitlePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.titleDisplayedColumns);
    this.langTitleSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadTitleHeadersAndColumns();
      this.userTitlePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.titleDisplayedColumns);
    });
  }

  onUserTitlePreferencesChanges(userTitlePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userTitlePreferences));
  }

  loadTitleHeadersAndColumns() {
    this.loadTitleHeaders();
    this.titleDisplayedColumns = this.titleColumns.filter(col => col.field !== 'label');
  }

  loadTitleHeaders(): void {
    this.titleColumns = [
      {
        field: 'label',
        minWidth: 110,
        header: this.translate.instant(_('TITLE.TABLE_TITLE.TITLE_LABEL'))
      },
      {
        field: 'title',
        minWidth: 110,
        header: this.translate.instant(_('TITLE.TABLE_TITLE.TITLE'))
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.langTitleSubscription) {
      this.langTitleSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['titles']) {
      this.prepareTableData();
    }
  }

  private prepareTableData() {
    if (this.titles().length > 0) {
      this.titleDisplayedColumns = [
        { field: 'name', header: 'Title' }
      ];
    }
  }

  applyTitleFilter(event: any, field: string) {
    const inputTitleFilterElement = event.target as HTMLInputElement;
    if (inputTitleFilterElement) {
      this.dt2.filter(inputTitleFilterElement.value, field, 'contains');
    }
  }

  // editTitle(title: Title) {
  //   const titleToEdit: Title = {
  //     id: title.id,
  //     name: title.name,
  //     createdAt: '',
  //     updatedAt: '',
  //     version: 0
  //   };

  //   this.titleUtils.getTitleById(titleToEdit.id).subscribe({
  //     next: (fullTitle) => {
  //       if (fullTitle) {
  //         this.titleStateService.setTitleToEdit(fullTitle);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error al cargar título:', err);
  //     }
  //   });
  // }

  editTitle(title: Title) {
    const fullTitle = this.titleService.titles().find(t => t.id === title.id);

    if (fullTitle) {
      this.titleStateService.setTitleToEdit(fullTitle);
    } else {
      console.warn('Error al cargar titulo:', title.id);
    }
  }



  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedTitle = null;
    }
  }
  onDialogShow() {
    if (this.modalType === 'create' && this.titleModalComponent) {
      this.titleModalComponent.focusInputIfNeeded();
    }
  }

  toastMessageDisplay(message: { severity: string, summary: string, detail: string }): void {
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    });
  }
}
