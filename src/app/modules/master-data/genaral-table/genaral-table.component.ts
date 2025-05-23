import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';

@Component({
  selector: 'master-data-genaral-table',
  standalone: false,
  templateUrl: './genaral-table.component.html',
  styleUrl: './genaral-table.component.scss'
})
export class GenaralTableComponent implements OnInit, OnChanges {
  @Input() tableId: string = '';
  @Input() tableTitle: string = 'Table title';
  @Input() removeKey: string = 'id';
  @Input() tableValues: any[] = [];
  @Input() columns: any[] = [];
  @Input() dataKeys: any[] = [];
  @Input() hideColumns: boolean = true;
  @Input() filterByColumns: boolean = true;
  @Input() nameNewButton: string = '';
  @Input() isFileUploadButtonVisible: boolean = false;
  selectedColumns: any[] = [];
  displayedColumns: any[] = [];
  @Input() userPreferences: any = [];

  @Output() onEditRegister = new EventEmitter<any>();
  @Output() onDeleteRegister = new EventEmitter<number>();
  @Output() onCreateRegister = new EventEmitter<string>();
  @Output() onColumnChanges = new EventEmitter<any>();
  @Output() onRowClickEvent = new EventEmitter<any>();

  @ViewChild('dt2') dt2!: Table;


  constructor(
  ){}

 
  changeSelect(event: any) {
    this.userPreferences[this.tableId].displayedColumns = event.value;
    this.onColumnChanges.emit(this.userPreferences);
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
    }

    let columnsPreferenceChange = changes['userPreferences'];
    if (columnsPreferenceChange && !columnsPreferenceChange.firstChange) {
      this.userPreferences = columnsPreferenceChange.currentValue;
    }
  }

  ngOnInit() {
    this.selectedColumns = [...this.columns];
  }

  editRegister(register: any){
    this.onEditRegister.emit(register);
  }

  deleteRegister(id: number) {
    this.onDeleteRegister.emit(id);
  }

  createRegister(register: string) {
    this.onCreateRegister.emit(register);
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
}
