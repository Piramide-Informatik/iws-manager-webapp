import { Component, ViewChild, OnInit, OnDestroy, inject, computed, SimpleChanges, OnChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { TitleService } from '../../../../../../Services/title.service';

@Component({
  selector: 'app-title-table',
  standalone: false,
  templateUrl: './title-table.component.html',
  styleUrl: './title-table.component.scss'
})
export class TitleTableComponent implements OnInit, OnDestroy, OnChanges {

  private readonly titleService = inject(TitleService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private subscriptions = new Subscription();

  readonly titles = computed(() => {
    return this.titleService.titles().map(title => ({
      id: title.id,
      title: title.name,  
    }));
  });

  titleColumns: any[] = [];
  titleDisplayedColumns: any[] = [];
   isChipsVisible = false;
  @ViewChild('dt') dt!: Table;

  private langTitleSubscription!: Subscription;

  constructor() { }

  ngOnInit() {
    this.loadTitleHeadersAndColumns();
    this.langTitleSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadTitleHeadersAndColumns();
    });
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
}
