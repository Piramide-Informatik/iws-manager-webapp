import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderComponent } from './order/order.component';
import { FrameworkAgreementsUtils } from '../../utils/framework-agreement.util';
import { BasicContract } from '../../../../Entities/basicContract';

@Component({
  selector: 'app-framework-agreement-details',
  templateUrl: './framework-agreement-details.component.html',
  styleUrls: ['./framework-agreement-details.component.scss'],
  standalone: false
})
export class FrameworkAgreementsDetailsComponent implements OnInit {
  private readonly frameworkUtils = inject(FrameworkAgreementsUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private readonly contractId = this.route.snapshot.params['idContract'];
  currentBasicContract!: BasicContract;
  @ViewChild(OrderComponent) orderComponent!: OrderComponent;
  isLoading: boolean = false;

  ngOnInit(): void {
    if(this.contractId){
      this.frameworkUtils.getFrameworkAgreementById(Number(this.contractId)).subscribe(contract => {
        if(contract){
          this.currentBasicContract = contract;
        }
      })
    }
  }

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