import { Component, ViewChild, OnInit, OnDestroy, inject, computed, SimpleChanges, OnChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { TitleService } from '../../../../../../Services/title.service';
import { TitleUtils } from '../../utils/title-utils';

@Component({
  selector: 'app-title-table',
  standalone: false,
  templateUrl: './title-table.component.html',
  styleUrl: './title-table.component.scss'
})
export class TitleTableComponent implements OnInit, OnDestroy, OnChanges {
  private readonly titleUtils = new TitleUtils();
  private readonly titleService = inject(TitleService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedTitle: number | null = null;
  titleName: string = '';

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedTitle = event.data;
  
      this.titleUtils.getTitleById(this.selectedTitle!).subscribe({
        next: (title) => {
          this.titleName = title?.name ?? '';
        },
        error: (err) => {
          console.error('No se pudo obtener el título:', err);
          this.titleName = '';
        }
      });
    }
    this.visibleModal = true;
  }

  readonly titles = computed(() => {
    return this.titleService.titles().map(title => ({
      id: title.id,
      title: title.name,  
      name: title.name
    }));
  });

  titleColumns: any[] = [];
  titleDisplayedColumns: any[] = [];
  isChipsVisible = false;
  userTitlePreferences: UserPreference = {};
  tableKey: string = 'Title'
  dataKeys = ['label', 'title'];

  @ViewChild('dt') dt!: Table;

  private langTitleSubscription!: Subscription;

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService,   
              private readonly translate: TranslateService ) { }

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

  ngOnDestroy() : void {
    if (this.langTitleSubscription) {
      this.langTitleSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['titles']) {
      console.log('Updated data:', this.titles());
      this.prepareTableData();
    }
  }

  private prepareTableData() {
    if (this.titles().length > 0) {
      this.titleDisplayedColumns = [
        { field: 'name', header: 'Title' },
        { field: 'createdAt', header: 'Created at' },
        { field: 'updatedAt', header: 'Updated at' }
      ];
    }
  }

  applyTitleFilter(event: any, field: string) {
    const inputTitleFilterElement = event.target as HTMLInputElement;
    if (inputTitleFilterElement) {
      this.dt.filter(inputTitleFilterElement.value, field, 'contains');
    }
  }

  onVisibleModal(visible: boolean){
    this.visibleModal = visible;
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedTitle = null;
    }
  }


  onTitleCreated(): void {
    // Lógica para crear nuevo título
    console.log('Nuevo título');
    // this.titleService.createTitle(titleName).subscribe(...);
  }

  onTitleDeleted(): void {
    // Lógica para eliminar título
    console.log('Eliminar título ID:');
    // this.titleService.deleteTitle(titleId).subscribe(...);
  }
}
