import { Component, Input, Output, EventEmitter, ViewChild, inject } from '@angular/core';
import { Popover } from 'primeng/popover';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-custom-popover',
  standalone: false,
  templateUrl: './custom-popover.component.html',
  styleUrls: ['./custom-popover.component.scss']
})
export class CustomPopoverComponent {
  private readonly translate = inject(TranslateService);

  @Input() type: 'list' | 'default' = 'default';
  @Input() values: any[] = [];

  // Attributes to display in the popover (in the desired order)
  @Input() displayFields: string[] = ['name', 'label'];

  // Fields to display as badges (optional)
  @Input() showAsBadge: string[] = ['label'];

  // Fields to format as percentage (optional)
  @Input() percentageFields: string[] = [];

  // Control visibility delete button
  @Input() showButtonDelete: boolean = true;

  @Output() selected = new EventEmitter<any>();

  @ViewChild('op') op!: Popover;

  // Soft colors for alternating backgrounds (8 different colors)
  private readonly itemColors = [
    '#eff6ff', // soft blue
    '#f5f3ff', // soft purple
    '#f0fdf4', // soft green
    '#fefce8', // soft yellow
    '#fdf2f8', // soft pink
    '#eef2ff', // soft indigo
    '#f0fdfa', // soft teal
    '#fff7ed'  // soft orange
  ];

  // Colors for badges (darker for contrast)
  private readonly badgeColors = [
    { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }, // blue
    { bg: '#e9d5ff', text: '#7c3aed', border: '#c4b5fd' }, // purple
    { bg: '#bbf7d0', text: '#15803d', border: '#86efac' }, // green
    { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }, // yellow
    { bg: '#fce7f3', text: '#be185d', border: '#f9a8d4' }, // pink
    { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' }, // indigo
    { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4' }, // teal
    { bg: '#fed7aa', text: '#c2410c', border: '#fdba74' }  // naranja
  ];

  toggle(event: Event) {
    this.op.toggle(event);
  }

  onSelect(item: any) {
    this.selected.emit(item);
    this.op.hide();
  }

  // Method to get the value of a field (without value translation)
  getFieldValue(item: any, field: string): string {
    if (!item || !field) return '';

    // Access to nested properties (e.g: 'user.name')
    const value = field.split('.').reduce((obj, key) => obj?.[key], item);

    // Format values according to the field type (without value translation)
    return this.formatValue(field, value);
  }

  // Method to format values (without value translation)
  private formatValue(field: string, value: any): string {
    if (value === null || value === undefined) return '';

    // Format as percentage if the field is in percentageFields
    if (this.isPercentageField(field)) {
      return this.formatAsPercentage(value);
    }

    // Format boolean (isHoliday) with icons (without translation)
    if (field === 'isHoliday') {
      return value ? '✔' : '✘';
    }

    // Format hours
    if (field === 'hours') {
      if (value === 0 || value === '0') return '';
      return `${value}h`;
    }

    // Return the value as it is (without translation)
    return value.toString();
  }

  // Method to check if a field should be formatted as a percentage
  private isPercentageField(field: string): boolean {
    return this.percentageFields.includes(field);
  }

  // Method to format a value as a percentage
  private formatAsPercentage(value: any): string {
    const numValue = Number.parseFloat(value);

    if (Number.isNaN(numValue)) {
      return value.toString();
    }

    // If the value is between 0 and 1, convert it to a percentage
    if (numValue <= 1 && numValue >= 0) {
      const percentage = (numValue * 100);
      // Round to maximum 2 decimals if necessary
      const rounded = percentage % 1 === 0 ? percentage : Number.parseFloat(percentage.toFixed(2));
      return `${rounded}%`;
    }

    // If the value is already a percentage (e.g: 50), add the % symbol
    return `${numValue}%`;
  }

  // Method to get the background color of an item based on the index
  getItemColor(index: number): string {
    const colorIndex = index % this.itemColors.length;
    return this.itemColors[colorIndex];
  }

  // Method to get the styles of a badge based on the index
  getBadgeStyles(index: number): any {
    const colorIndex = index % this.badgeColors.length;
    const color = this.badgeColors[colorIndex];

    return {
      'backgroundColor': color.bg,
      'color': color.text,
      'borderColor': color.border
    };
  }

  // Method to check if a field should be displayed as a badge
  shouldShowAsBadge(field: string): boolean {
    return this.showAsBadge.includes(field);
  }

  // Method to get the raw value of a field (for comparisons)
  getRawValue(item: any, field: string): any {
    if (!item || !field) return null;
    return field.split('.').reduce((obj, key) => obj?.[key], item);
  }

  // Method to determine if a separator should be shown
  shouldShowSeparator(fieldIndex: number): boolean {
    return fieldIndex < this.displayFields.length - 1;
  }

  // Method to get the background color of an item
  getItemBackgroundColor(index: number): string {
    return this.getItemColor(index);
  }

  // Method to check if the item is a holiday
  isHoliday(item: any): boolean {
    const holidayValue = this.getRawValue(item, 'isHoliday');
    return holidayValue === 1 || holidayValue === true || holidayValue === '1';
  }
}