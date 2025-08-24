import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { OrderUtils } from '../../utils/order-utils';
import { OrderComponent } from './order/order.component';
import { ProjectComponent } from './project/project.component';
import { IwsProvisionComponent } from './iws-provision/iws-provision.component';
import { Project } from '../../../../Entities/project';
import { Order } from '../../../../Entities/order';

@Component({
  selector: 'app-order-details',
  standalone: false,
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.scss'
})
export class OrderDetailsComponent implements OnInit {
  private readonly orderUtils = inject(OrderUtils);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  @ViewChild(OrderComponent) orderComponent!: OrderComponent;
  @ViewChild(ProjectComponent) projectComponent!: ProjectComponent;
  @ViewChild(IwsProvisionComponent) iwsProvisionComponent!: IwsProvisionComponent;

  public isLoading: boolean = false;
  private project: Project | null = null;
  private orderCommission!: {fixCommission: number, maxCommission: number, iwsProvision: number};
  private newOrder!: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'version'>;
  public showOCCErrorModalOrder = false;

  private readonly orderId = this.activatedRoute.snapshot.params['orderId'];
  currentOrder!: Order;

  ngOnInit(): void {
    if(this.orderId){
      this.orderUtils.getOrderById(Number(this.orderId)).subscribe(order => {
        if(order){
          this.currentOrder = order;
        }
      })
    }
  }

  public onSubmit(): void {
    this.iwsProvisionComponent.onSubmit();
    this.projectComponent.onSubmit();
    this.orderComponent.onSubmit();

    this.isLoading = true;
    if(this.currentOrder) {
      this.updateOrder();
    } else {
      this.createNewOrder();
    }
  }

  private createNewOrder(): void {
    this.newOrder = {
      ...this.newOrder,
      project: this.project,
      promoter: this.project?.promoter ?? null,
      fixCommission: this.orderCommission.fixCommission,
      maxCommission: this.orderCommission.maxCommission,
      iwsProvision: this.orderCommission.iwsProvision
    }

    this.orderUtils.createOrder(this.newOrder).subscribe({
      next: (createdOrder) => {
        this.isLoading = false;
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.orderComponent.clearOrderForm();
        this.projectComponent.clearOrderProjectForm();
        this.iwsProvisionComponent.clearIwsCommissionForm();
        setTimeout(()=>{
          this.resetFormAndNavigation(createdOrder.id);
        },2000)
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error);
        this.commonMessageService.showErrorCreatedMessage();
      }
    });
  }

  private updateOrder(): void {
    const updatedOrder: Order = {
      id: this.currentOrder.id,
      version: this.currentOrder.version,
      createdAt: this.currentOrder.createdAt,
      updatedAt: this.currentOrder.updatedAt,
      ...this.newOrder,
      project: this.project,
      promoter: this.project?.promoter ?? null,
      fixCommission: this.orderCommission.fixCommission,
      maxCommission: this.orderCommission.maxCommission,
      iwsProvision: this.orderCommission.iwsProvision
    }

    this.orderUtils.updateOrder(updatedOrder).subscribe({
      next: (updateded) => {
        this.isLoading = false;
        this.commonMessageService.showEditSucessfullMessage();
        this.currentOrder = updateded;
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error)
        if (error.message === 'Conflict detected: order version mismatch') {
          this.showOCCErrorModalOrder = true;
        }else{
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  public onOrderCommission(event: {fixCommission: number, maxCommission: number, iwsProvision: number}) {
    this.orderCommission = event;
  }

  public onOrderProject(selectedProject: Project | null): void {
    this.project = selectedProject;
  }

  public onOrder(newOrderIncomplete: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'version'>): void {
    this.newOrder = newOrderIncomplete;
  }

  goBackListOrders() {
    this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
  }

  private resetFormAndNavigation(id: number): void {
    this.router.navigate(['.', id], { relativeTo: this.activatedRoute });
  }
}
