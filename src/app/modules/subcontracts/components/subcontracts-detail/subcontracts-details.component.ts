import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubcontractComponent } from './subcontract/subcontract.component';
import { SubcontractUtils } from '../../utils/subcontracts-utils';
import { Subcontract } from '../../../../Entities/subcontract';
import { Subscription, switchMap } from 'rxjs';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { SubcontractStateService } from '../../utils/subcontract-state.service';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';

@Component({
  selector: 'app-subcontracts-details',
  standalone: false,
  templateUrl: './subcontracts-details.component.html',
  styleUrls: ['./subcontracts-details.component.scss'],
})
export class SubcontractsDetailsComponent implements OnInit {
  private readonly subcontractUtils = inject(SubcontractUtils);
  private readonly subcontractStateService = inject(SubcontractStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  @ViewChild(SubcontractComponent) subcontractComponent!: SubcontractComponent;
  subcontractId!: number;
  currentSubcontract!: Subcontract;

  visibleSubcontractModal: boolean = false;
  isLoading: boolean = false;

  public showOCCErrorModalSubcontract = false;
  public redirectRoute = "";
  public errorType: OccErrorType = 'UPDATE_UNEXISTED';

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const routeSub = this.activatedRoute.params.pipe(
      switchMap(params => {
        this.subcontractId = params['subContractId'];
        return this.subcontractUtils.getSubcontractById(this.subcontractId);
      })
    ).subscribe({
      next: (subcontract) => {
        if (subcontract) {
          this.subcontractStateService.notifySubcontractUpdate(subcontract);
          this.subcontractStateService.currentSubcontract$.subscribe(updatedSubcontract => {
            if (updatedSubcontract)
              this.currentSubcontract = updatedSubcontract;
          });
        }
      },
      error: (err) => console.error('Error al cargar subcontrato:', err)
    });

    this.subscriptions.add(routeSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    this.subcontractComponent.onSubmit();
  }

  goBackListSubcontracts(): void {
    const path = this.subcontractId ? '../../' : '../'
    this.router.navigate([path], { relativeTo: this.activatedRoute });
  }

  setLoadingOperation(loading: boolean): void {
    this.isLoading = loading;
  }

  public onSubcontractDeleteConfirm() {
    this.isLoading = true;
    if (this.currentSubcontract) {
      this.subcontractUtils.deleteSubcontract(this.currentSubcontract.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.visibleSubcontractModal = false;
          this.commonMessageService.showDeleteSucessfullMessage();
          this.goBackListSubcontracts();
        },
        error: (error) => {
          this.isLoading = false;
          this.handleDeleteError(error);
          //   if (error.message.includes('have associated subcontract projects') ||
          //     error.message.includes('have associated subcontract years')) {
          //     this.commonMessageService.showErrorDeleteMessageContainsOtherEntities();
          //   } else {
          //     this.commonMessageService.showErrorDeleteMessage();
          //   }
          // }
        }
      });
    }
  }

  private handleDeleteError(error: any) {
    if (error.message.includes('have associated subcontract projects') ||
      error.message.includes('have associated subcontract years')) {
      this.commonMessageService.showErrorDeleteMessageContainsOtherEntities();
    } else if (error instanceof OccError || error?.message?.includes('404') || error?.errorType === 'DELETE_UNEXISTED') {
      this.showOCCErrorModalSubcontract = true;
      this.errorType = 'DELETE_UNEXISTED';
      this.visibleSubcontractModal = false;
      this.redirectRoute = "/customers/subcontracts/" + this.currentSubcontract.customer?.id;
      return;
    } else {
      this.commonMessageService.showErrorDeleteMessage();
    }
  }
}
