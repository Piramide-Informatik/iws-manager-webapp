import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';

@Component({
  selector: 'master-data-genaral-table',
  standalone: false,
  templateUrl: './genaral-table.component.html',
  styleUrl: './genaral-table.component.scss'
})
export class GenaralTableComponent implements OnInit, OnChanges {
  @Input() tableTitle: string = 'Table title';
  @Input() tableValues: any[] = [];
  @Input() columns: any[] = [];
  @Input() hideColumns: boolean = true;
  @Input() filterByColumns: boolean = true;
  @Input() nameNewButton: string = '';
  selectedColumns: any[] = [];

  @Output() onEditRegister = new EventEmitter<string>();
  @Output() onDeleteRegister = new EventEmitter<number>();
  @Output() onCreateRegister = new EventEmitter<string>();

  @ViewChild('dt2') dt2!: Table;

  constructor(
  ){}

  ngOnChanges(changes: SimpleChanges): void {
    let columnsChange = changes['columns'];
    if (!columnsChange.firstChange) {
      this.columns = columnsChange.currentValue;
      this.selectedColumns = [...this.columns];
    }
  }

  ngOnInit() {
    this.selectedColumns = [...this.columns];
  }

  editRegister(register: string){
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
}
