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

  // Attributes to show in the popover (in the desired order)
  @Input() displayFields: string[] = ['name', 'label'];

  // Fields to show as badges (optional)
  @Input() showAsBadge: string[] = ['label'];

  // Fields to format as percentage (optional)
  @Input() percentageFields: string[] = [];

  @Output() selected = new EventEmitter<any>();

  @ViewChild('op') op!: Popover;

  // Colors for items (8 different colors)
  private itemColors = [
    '#eff6ff', // blue
    '#f5f3ff', // purple
    '#f0fdf4', // green
    '#fefce8', // yellow
    '#fdf2f8', // pink
    '#eef2ff', // indigo
    '#f0fdfa', // teal
    '#fff7ed'  // orange
  ];

  // Colors for badges (darker for contrast)
  private badgeColors = [
    { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }, // azul
    { bg: '#e9d5ff', text: '#7c3aed', border: '#c4b5fd' }, // purple
    { bg: '#bbf7d0', text: '#15803d', border: '#86efac' }, // green
    { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }, // yellow
    { bg: '#fce7f3', text: '#be185d', border: '#f9a8d4' }, // pink
    { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' }, // indigo
    { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4' }, // teal
    { bg: '#fed7aa', text: '#c2410c', border: '#fdba74' }  // orange
  ];

  toggle(event: Event) {
    this.op.toggle(event);
  }

  onSelect(item: any) {
    this.selected.emit(item);
    this.op.hide();
  }

  // Method to get field value with translation if applies
  getFieldValue(item: any, field: string): string {
    if (!item || !field) return '';

    // Access to nested properties (e.g: 'user.name')
    const value = field.split('.').reduce((obj, key) => obj?.[key], item);

    // Try to translate the value (for fields like 'name' that can have translations)
    const translatedValue = this.tryTranslateValue(field, value);
    if (translatedValue !== null) {
      return this.formatValue(field, translatedValue);
    }

    // If there is no translation, format normally
    return this.formatValue(field, value);
  }

  // Method to try translate a value
  private tryTranslateValue(field: string, value: any): string | null {
    if (!value) return null;

    // For specific fields that we know have translations
    if (field === 'name' || field === 'label') {
      const translationKey = `CUSTOM_POPOVER.${field.toUpperCase()}.${value}`;
      const translation = this.translate.instant(translationKey);

      // Si la traducción existe y no es igual a la clave, usar la traducción
      if (translation !== translationKey) {
        return translation;
      }
    }

    return null;
  }

  // Method to format value
  private formatValue(field: string, value: any): string {
    if (value === null || value === undefined) return '';

    // Format as percentage if the field is in percentageFields
    if (this.isPercentageField(field)) {
      return this.formatAsPercentage(value);
    }

    // Format booleans (isHoliday) with translated icons
    if (field === 'isHoliday') {
      return value ? '✔' : '✘';
    }

    // Format hours
    if (field === 'hours') {
      if (value === 0 || value === '0') return '';
      return `${value}h`;
    }

    return value.toString();
  }

  // Method to verify if a field should be formatted as percentage
  private isPercentageField(field: string): boolean {
    return this.percentageFields.includes(field);
  }

  // Method to format a value as percentage
  private formatAsPercentage(value: any): string {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return value.toString();
    }

    // If the value is between 0 and 1, convert it to percentage
    if (numValue <= 1 && numValue >= 0) {
      const percentage = (numValue * 100);
      // Round to maximum 2 decimals if necessary
      const rounded = percentage % 1 === 0 ? percentage : parseFloat(percentage.toFixed(2));
      return `${rounded}%`;
    }

    // If the value is already a percentage (e.g: 50), add the % symbol
    return `${numValue}%`;
  }

  // Method to get background color based on index
  getItemColor(index: number): string {
    const colorIndex = index % this.itemColors.length;
    return this.itemColors[colorIndex];
  }

  // Method to get badge styles based on index
  getBadgeStyles(index: number): any {
    const colorIndex = index % this.badgeColors.length;
    const color = this.badgeColors[colorIndex];

    return {
      'backgroundColor': color.bg,
      'color': color.text,
      'borderColor': color.border
    };
  }

  // Method to verify if a field should be shown as badge
  shouldShowAsBadge(field: string): boolean {
    return this.showAsBadge.includes(field);
  }

  // Method to get the value without formatting (for comparisons)
  getRawValue(item: any, field: string): any {
    if (!item || !field) return null;
    return field.split('.').reduce((obj, key) => obj?.[key], item);
  }

  // Method to determine if separator should be shown
  shouldShowSeparator(fieldIndex: number): boolean {
    return fieldIndex < this.displayFields.length - 1;
  }

  // Method to get the CSS class for the background color
  getItemBackgroundColor(index: number): string {
    return this.getItemColor(index);
  }

  // Method to get translated text
  getTranslatedText(key: string, params?: any): string {
    return this.translate.instant(key, params);
  }

  // Method to verify if it's a holiday (with improved logic)
  isHoliday(item: any): boolean {
    const holidayValue = this.getRawValue(item, 'isHoliday');
    return holidayValue === 1 || holidayValue === true || holidayValue === '1';
  }
}