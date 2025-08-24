import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderComponent } from './order/order.component';

@Component({
  selector: 'app-framework-agreement-details',
  templateUrl: './framework-agreement-details.component.html',
  styleUrls: ['./framework-agreement-details.component.scss'],
  standalone: false
})
export class FrameworkAgreementsDetailsComponent {
  @ViewChild(OrderComponent) orderComponent!: OrderComponent;
  isLoading: boolean = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router

  ) {}

  onSubmit(): void {
    this.orderComponent.onSubmit();
  }

  setLoading(value: boolean): void {
    this.isLoading = value;
  }

  goBackFrameworksAgreement() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}