import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Popover } from 'primeng/popover';

@Component({
  selector: 'app-custom-popover',
  standalone: false,
  templateUrl: './custom-popover.component.html',
  styleUrls: ['./custom-popover.component.scss']
})
export class CustomPopoverComponent {
  @Input() type: 'list' | 'default' = 'default';
  @Input() values: any[] = [];

  // Atributos a mostrar en el popover (en el orden deseado)
  @Input() displayFields: string[] = ['name', 'label'];

  // Campos que se mostrarán como badges (opcional)
  @Input() showAsBadge: string[] = ['label'];

  // Campos que deben formatearse como porcentaje (opcional)
  @Input() percentageFields: string[] = [];

  @Output() selected = new EventEmitter<any>();

  @ViewChild('op') op!: Popover;

  // Colores suaves para fondos alternados (8 colores diferentes)
  private itemColors = [
    '#eff6ff', // azul suave
    '#f5f3ff', // violeta suave
    '#f0fdf4', // verde suave
    '#fefce8', // amarillo suave
    '#fdf2f8', // rosa suave
    '#eef2ff', // índigo suave
    '#f0fdfa', // teal suave
    '#fff7ed'  // naranja suave
  ];

  // Colores para badges (más oscuros para contraste)
  private badgeColors = [
    { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }, // azul
    { bg: '#e9d5ff', text: '#7c3aed', border: '#c4b5fd' }, // violeta
    { bg: '#bbf7d0', text: '#15803d', border: '#86efac' }, // verde
    { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' }, // amarillo
    { bg: '#fce7f3', text: '#be185d', border: '#f9a8d4' }, // rosa
    { bg: '#e0e7ff', text: '#3730a3', border: '#a5b4fc' }, // índigo
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

  // Método para obtener el valor de un campo
  getFieldValue(item: any, field: string): string {
    if (!item || !field) return '';

    // Acceso a propiedades anidadas (ej: 'user.name')
    const value = field.split('.').reduce((obj, key) => obj?.[key], item);

    // Formatear valores según el tipo de campo
    return this.formatValue(field, value);
  }

  // Método para formatear valores
  private formatValue(field: string, value: any): string {
    if (value === null || value === undefined) return '';

    // Formatear como porcentaje si el campo está en percentageFields
    if (this.isPercentageField(field)) {
      return this.formatAsPercentage(value);
    }

    // Formatear booleanos (isHoliday)
    if (field === 'isHoliday') {
      return value ? '✔' : '✘'; // Usar iconos en lugar de texto
    }

    // Formatear horas
    if (field === 'hours') {
      return value === 0 ? '' : `${value}h`;
    }

    return value.toString();
  }

  // Método para verificar si un campo debe formatearse como porcentaje
  private isPercentageField(field: string): boolean {
    return this.percentageFields.includes(field);
  }

  // Método para formatear un valor como porcentaje
  private formatAsPercentage(value: any): string {
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      return value.toString();
    }

    // Si el valor ya está entre 0 y 1, convertirlo a porcentaje
    if (numValue <= 1 && numValue >= 0) {
      const percentage = (numValue * 100);
      // Redondear a máximo 2 decimales si es necesario
      const rounded = percentage % 1 === 0 ? percentage : parseFloat(percentage.toFixed(2));
      return `${rounded}%`;
    }

    // Si el valor ya está como porcentaje (ej: 50), agregar el símbolo %
    return `${numValue}%`;
  }

  // Método para obtener color de fondo basado en el índice
  getItemColor(index: number): string {
    const colorIndex = index % this.itemColors.length;
    return this.itemColors[colorIndex];
  }

  // Método para obtener estilos de badge basado en el índice
  getBadgeStyles(index: number): any {
    const colorIndex = index % this.badgeColors.length;
    const color = this.badgeColors[colorIndex];

    return {
      'backgroundColor': color.bg,
      'color': color.text,
      'borderColor': color.border
    };
  }

  // Método para verificar si un campo debe mostrarse como badge
  shouldShowAsBadge(field: string): boolean {
    return this.showAsBadge.includes(field);
  }

  // Método para obtener el valor sin formatear (para comparaciones)
  getRawValue(item: any, field: string): any {
    if (!item || !field) return null;
    return field.split('.').reduce((obj, key) => obj?.[key], item);
  }

  // Método para determinar si mostrar separador
  shouldShowSeparator(fieldIndex: number): boolean {
    return fieldIndex < this.displayFields.length - 1;
  }

  // Método para obtener la clase CSS del color de fondo
  getItemBackgroundColor(index: number): string {
    return this.getItemColor(index);
  }
}