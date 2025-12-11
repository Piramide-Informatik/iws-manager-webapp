import { AfterViewChecked, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { MultiSelect } from 'primeng/multiselect';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Column } from '../../../Entities/column';

@Component({
  selector: 'master-data-genaral-table',
  standalone: false,
  templateUrl: './genaral-table.component.html',
  styleUrl: './genaral-table.component.scss'
})

export class GenaralTableComponent implements OnInit, OnChanges, AfterViewChecked {
  @Input() tableId: string = '';
  @Input() tableTitle: string = 'Table title';
  @Input() removeKey: string = 'id';
  @Input() tableValues: any[] = [];
  @Input() columns: Column[] = [];
  @Input() dataKeys: any[] = [];
  @Input() hideColumns: boolean = true;
  @Input() filterByColumns: boolean = true;
  @Input() nameNewButton: string = '';
  @Input() showButtonNew: boolean = true;
  @Input() showButtonsEditDelete: boolean = true;
  @Input() isFileUploadButtonVisible: boolean = false;
  @Input() isAdditionalButtonsVisible: boolean = false;
  @Input() additionalButtonText: string = '';
  @Input() acceptFilesFormats: string = '.pdf,.xml,.csv'
  @Input() userPreferences: any = [];
  @Input() customerUploadButtonText = '';
  @Input() disableButtons: boolean = false;
  @Input() enableCreateButton: boolean = false;
  @Input() sortField: any = null;
  @Input() sortOrder: any = null;
  selectedColumns: any[] = [];
  displayedColumns: any[] = [];
  booleanHeaders: any[] = [];

  colOrders: any = {};
  readonly defaultDateFormat = "dd.MM.yyyy";

  @Output() onEditRegister = new EventEmitter<any>();
  @Output() onDeleteRegister = new EventEmitter<number>();
  @Output() onCreateRegister = new EventEmitter<string>();
  @Output() additionalAccion = new EventEmitter<void>();
  @Output() onColumnChanges = new EventEmitter<any>();
  @Output() onRowClickEvent = new EventEmitter<any>();

  private langSubscription!: Subscription;

  @ViewChild('dt2') dt2!: Table;
  @ViewChild('hiddenColumns') selectHiddenColumns!: MultiSelect;


  constructor(
    private readonly translate: TranslateService,
    private readonly messageService: MessageService
  ) { }

  ngAfterViewChecked(): void {
    this.loadStorageData();
    this.fixFirstColumnWidth();
  }

  generateBooleanHeaders(): any[] {
    return [
      {
        value: true,
        header: this.translate.instant(_('COMMON.YES'))
      },
      {
        value: false,
        header: this.translate.instant(_('COMMON.NO'))
      }
    ];
  }

  changeSelect(event: any) {
    if (event.value.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('MESSAGE.ERROR'),
        detail: this.translate.instant('MESSAGE.SELECT_AT_LEAST_ONE')
      });
      if (event.itemValue) {
        this.selectHiddenColumns.updateModel([event.itemValue])
      } else {
        this.selectHiddenColumns.updateModel([this.columns[0]])
        this.userPreferences[this.tableId].displayedColumns = [this.columns[0]];
      }
    } else {
      this.userPreferences[this.tableId].displayedColumns = event.value;
      this.processColumnsOrders();
      this.onColumnChanges.emit(this.userPreferences);
    }
  }

  onTableFilterChange(event: any) {
    if (this.dt2) {
      this.userPreferences[this.tableId].filter = this.dt2.filters;
      this.onColumnChanges.emit(this.userPreferences);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    let columnsChange = changes['columns'];
    if (columnsChange && !columnsChange.firstChange) {
      this.columns = columnsChange.currentValue;
      this.selectedColumns = [...this.columns];
      this.calculateOrderColumns();
      if (this.userPreferences[this.tableId]?.displayedColumns) {
        this.processColumnsOrders();
      }
    }

    let valueChange = changes['tableValues'];
    if (valueChange && !valueChange.firstChange) {
      this.tableValues = valueChange.currentValue;
    }

    let columnsPreferenceChange = changes['userPreferences'];
    if (columnsPreferenceChange && !columnsPreferenceChange.firstChange) {
      this.userPreferences = columnsPreferenceChange.currentValue;
    }
  }

  ngOnInit() {
    this.selectedColumns = this.columns ? [...this.columns] : [];
    this.booleanHeaders = this.generateBooleanHeaders();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.booleanHeaders = this.generateBooleanHeaders();
    });
    this.calculateOrderColumns();
    if (this.userPreferences[this.tableId]?.displayedColumns) {
      this.processColumnsOrders();
    }
  }

  editRegister(register: any) {
    this.onEditRegister.emit(register);
  }

  deleteRegister(id: number) {
    this.onDeleteRegister.emit(id);
  }

  createRegister(register: string) {
    this.onCreateRegister.emit(register);
  }

  additionalButtonAction() {
    this.additionalAccion.emit();
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  onClickRow(row: any) {
    this.onRowClickEvent.emit(row);
  }

  calculateOrderColumns() {
    if (this.columns) {
      this.colOrders = this.columns.reduce((acc: any, curr: any, index: number) => {
        acc[curr.field] = index;
        return acc;
      }, {})
    }
  }

  processColumnsOrders() {
    const aux = this.userPreferences[this.tableId].displayedColumns;
    this.userPreferences[this.tableId].displayedColumns = aux.map((column: any) => Object.assign(column, { pos: this.colOrders[column.field] })).sort((a: any, b: any) => a.pos - b.pos);
  }
  loadStorageData() {
    if (!localStorage.getItem(this.dt2.stateKey ?? '')) {
      this.dt2._filter();
    }
  }

  fixFirstColumnWidth(): void {
    const firstHeader = document.getElementById('hide-columns') as HTMLElement;
    if (firstHeader) {
      firstHeader.style.width = '75px';
      firstHeader.style.minWidth = '75px';
      firstHeader.style.maxWidth = '75px';
    }

    const table = this.dt2?.el?.nativeElement as HTMLElement;
    if (table) {
      const rows = table.querySelectorAll('tbody > tr');
      for(const row of rows){
        const firstCell = row.querySelector('td') as HTMLElement;
        if (firstCell) {
          firstCell.style.width = '75px';
          firstCell.style.minWidth = '75px';
          firstCell.style.maxWidth = '75px';
        }
      }
    }
  }

  isNumeric(value: any): boolean {
    return typeof value === 'number' && !Number.isNaN(value);
  }

  getNestedValue(obj: any, path: string): any {
    const value = path.split('.').reduce((acc, part) => acc?.[part], obj);
    // Si el valor es null o undefined, devolverlo tal cual
    if (value == null) return value;
    
    // Si es un string que representa un número, convertirlo
    if (typeof value === 'string') {
        const num = Number(value);
        // Verificar si la conversión fue exitosa (no es NaN)
        // y que el string original no esté vacío
        return value.trim() !== '' && !Number.isNaN(num) ? num : value;
    }
    
    // Si ya es un número, devolverlo
    if (typeof value === 'number') return value;
    
    // Para otros tipos, devolver el valor original
    return value;
  }

}
