# Guía de Alineación Numérica para el Componente General-Table

## Introducción
Esta guía explica cómo utilizar `customClasses` para alinear columnas numéricas a la derecha en el componente `genaral-table`.

## Implementación con customClasses

### Uso de `customClasses: ['align-right']`
Para alinear columnas numéricas a la derecha, utiliza la propiedad `customClasses`:

```typescript
{
  field: 'rate',
  header: 'Tax Rate',
  customClasses: ['align-right']  // Alinea la columna a la derecha
}
```

## Ejemplos de Implementación

### Sales Tax Table
```typescript
{
  field: 'rate',
  minWidth: 110,
  header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX.CURRENT_TAX_RATE')),
  customClasses: ['align-right']  // ✅ Números alineados a la derecha
}
```

### Funding Programs Table
```typescript
{
  field: 'rate',
  styles: { width: '100px' },
  header: this.translate.instant(_('FUNDING.TABLE.RATE')),
  customClasses: ['align-right']  // ✅ Porcentajes alineados a la derecha
}
```

### Costs Table
```typescript
{
  field: 'sort',
  styles: { width: '100px' },
  header: this.translate.instant(_('COSTS.TABLE.SORT')),
  customClasses: ['align-right']  // ✅ Números de orden alineados a la derecha
}
```

### Customer Table
```typescript
{
  field: 'id',
  minWidth: 110,
  customClasses: ['align-right'],
  header: this.translate.instant(_('CUSTOMERS.TABLE.CUSTOMER_ID'))  // ✅ IDs alineados a la derecha
}
```

### Employee Contracts Table
```typescript
{
  field: 'salaryPerMonth',
  header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.SALARY_PER_MONTH')),
  customClasses: ['align-right']  // ✅ Salarios alineados a la derecha
}
```

## Clase CSS Disponible

### `.align-right`
- Alinea el contenido de la celda a la derecha
- Aplicado solo a las celdas de datos (no afecta headers)
- Simple y directo

## Mejores Prácticas

### ✅ Usar `customClasses: ['align-right']` para:
- Números enteros (IDs, orden, cantidad)
- Decimales (precios, porcentajes, tasas)
- Códigos numéricos
- Fechas en formato numérico
- Montos monetarios

### ✅ Ventajas del enfoque customClasses:
- **Simple**: No requiere lógica adicional en el template
- **Flexible**: Puedes agregar múltiples clases CSS
- **Directo**: Mapeo directo de clases CSS
- **Existente**: Usa funcionalidad ya implementada

## Resultado Visual

```
| Product Name    |   Rate |  ← Solo datos alineados a la derecha
|-----------------|--------|
| Standard Tax    |  19.00 |
| Reduced Tax     |   7.00 |
| Zero Tax        |   0.00 |
```

## Migración

Para usar en tablas existentes:

1. Identifica columnas numéricas
2. Agrega `customClasses: ['align-right']` a las definiciones de columna
3. Los headers se mantienen sin cambios
4. Solo las celdas de datos se alinean a la derecha

## Combinación con Otras Clases

Puedes combinar múltiples clases CSS:

```typescript
{
  field: 'amount',
  header: 'Amount',
  customClasses: ['align-right', 'font-bold', 'text-primary']  // Múltiples clases
}
```

## Beneficios

1. **📊 Mejor Legibilidad**: Los números alineados a la derecha son más fáciles de comparar
2. **🎨 Headers Limpios**: Los headers mantienen su estilo original
3. **⚡ Simple**: Solo agrega `customClasses: ['align-right']`
4. **📱 Responsive**: Funciona en todos los tamaños de pantalla
5. **🔧 Reutilizable**: Usa el sistema existente de customClasses
