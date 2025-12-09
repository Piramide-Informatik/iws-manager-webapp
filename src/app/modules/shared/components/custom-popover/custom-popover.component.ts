import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'app-custom-popover',
  standalone: false,
  templateUrl: './custom-popover.component.html',
  styleUrl: './custom-popover.component.scss'
})
export class CustomPopoverComponent {

  @Input() type: 'list' | 'default' = 'default';
  @Input() values: any[] = [];
  @Output() selected = new EventEmitter<any>();

  @ViewChild('op') op!: Popover;

  toggle(event: Event) {
    this.op.toggle(event);
  }

  onSelect(item: any) {
    this.selected.emit(item);
    this.op.hide();
  }
}
