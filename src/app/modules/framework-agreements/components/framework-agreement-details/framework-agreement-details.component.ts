import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderComponent } from './order/order.component';
import { FrameworkAgreementsUtils } from '../../utils/framework-agreement.util';
import { BasicContract } from '../../../../Entities/basicContract';
import { IwsProvisionComponent } from './iws-provision/iws-provision.component';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';
import { HttpErrorResponse } from '@angular/common/http';

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
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalBasicContract = false;
  public redirectRoute = "";
  currentBasicContract!: BasicContract;
  visibleFrameworkAgreementModalEntity = false;
  
  @ViewChild(OrderComponent) orderComponent!: OrderComponent;
  @ViewChild(IwsProvisionComponent) iwsProvisionComponent!: IwsProvisionComponent;

  isLoadingDelete = false;
  isLoading: boolean = false;

  constructor(private readonly commonMessageService: CommonMessagesService) { }

  ngOnInit(): void {
    if (this.contractId) {
      this.frameworkUtils.getFrameworkAgreementById(Number(this.contractId)).subscribe(contract => {
        if (contract) {
          this.currentBasicContract = contract;
          if (this.iwsProvisionComponent) {
            this.iwsProvisionComponent.setBasicContract(contract);
          }
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
    const path = this.contractId ? '../../' : '../'
    this.router.navigate([path], { relativeTo: this.route });
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message?.includes('404')) {
      this.showOCCErrorModalBasicContract = true;
      this.occErrorType = 'DELETE_UNEXISTED';
      this.commonMessageService.showErrorDeleteMessage();
      this.visibleFrameworkAgreementModalEntity = false;
      this.redirectRoute = "/customers/framework-agreements/" + this.currentBasicContract.customer?.id;
    } else if (error instanceof HttpErrorResponse && error.status === 500 && error.error.message.includes('foreign key constraint')){
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
    } else {
      this.commonMessageService.showErrorDeleteMessage();
    }
  }

  onFrameworkAgreementDeleteConfirm() {
    this.isLoadingDelete = true;
    this.frameworkUtils.deleteFrameworkAgreement(this.currentBasicContract.id).subscribe({
      next: () => {
        this.isLoadingDelete = false;
        this.commonMessageService.showDeleteSucessfullMessage()
        this.visibleFrameworkAgreementModalEntity = false;
        this.goBackFrameworksAgreement();
      },
      error: (error) => {
        this.isLoadingDelete = false;
        this.visibleFrameworkAgreementModalEntity = false;
        this.handleDeleteError(error);
      }
    })
  }
}