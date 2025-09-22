import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderComponent } from './order/order.component';
import { FrameworkAgreementsUtils } from '../../utils/framework-agreement.util';
import { BasicContract } from '../../../../Entities/basicContract';
import { IwsProvisionComponent } from './iws-provision/iws-provision.component';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';

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
  public modeForm: 'create' | 'edit' = 'create';
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalBasicContract = false;
  public redirectRoute = "";
  currentBasicContract!: BasicContract;
  visibleFrameworkAgreementModalEntity = false;
  isFrameworkAgreementEntityLoading = false;

  @ViewChild(OrderComponent) orderComponent!: OrderComponent;
  @ViewChild(IwsProvisionComponent) iwsProvisionComponent!: IwsProvisionComponent;

  isLoading: boolean = false;

  constructor(private readonly commonMessageService: CommonMessagesService) { }

  ngOnInit(): void {
    if (this.contractId) {
      this.modeForm = 'edit';
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
    const path = this.modeForm === 'edit' ? '../../' : '../'
    this.router.navigate([path], { relativeTo: this.route });
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message?.includes('404')) {
      this.showOCCErrorModalBasicContract = true;
      this.occErrorType = 'DELETE_UNEXISTED';
      this.visibleFrameworkAgreementModalEntity = false;
      this.redirectRoute = "/customers/framework-agreements/" + this.currentBasicContract.customer?.id;
    }
  }

  onFrameworkAgreementDeleteConfirm() {
    this.isFrameworkAgreementEntityLoading = true;
    this.frameworkUtils.deleteFrameworkAgreement(this.currentBasicContract.id).subscribe({
      next: () => {
        this.commonMessageService.showDeleteSucessfullMessage()
        this.visibleFrameworkAgreementModalEntity = false;
        this.goBackFrameworksAgreement();
      },
      error: (error) => {
        this.handleDeleteError(error);
        if (error.message.includes('have associated orders')) {
          this.commonMessageService.showErrorDeleteMessageContainsOtherEntities();
        } else {
          this.commonMessageService.showErrorDeleteMessage();
        }
      }
    })
  }
}