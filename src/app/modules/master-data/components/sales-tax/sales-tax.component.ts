import { Component } from '@angular/core';

@Component({
  selector: 'app-sales-tax',
  standalone: false,
  templateUrl: './sales-tax.component.html',
  styleUrl: './sales-tax.component.scss'
})
export class SalesTaxComponent {

  vatEdited: boolean = false;

  vatRateEdited: boolean = false;
}
