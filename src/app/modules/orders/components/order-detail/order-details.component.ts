import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-order-details',
  standalone: false,
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent {

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ){}

  goBackListOrders() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }
}
