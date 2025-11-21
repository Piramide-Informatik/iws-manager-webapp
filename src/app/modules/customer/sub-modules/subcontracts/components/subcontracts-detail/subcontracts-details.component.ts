import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubcontractComponent } from './subcontract/subcontract.component';
import { SubcontractUtils } from '../../utils/subcontracts-utils';
import { Subcontract } from '../../../../../../Entities/subcontract';
import { Subscription, switchMap } from 'rxjs';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { SubcontractStateService } from '../../utils/subcontract-state.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-subcontracts-details',
  standalone: false,
  templateUrl: './subcontracts-details.component.html',
  styleUrls: ['./subcontracts-details.component.scss'],
})
export class SubcontractsDetailsComponent implements OnInit, OnDestroy {
  private readonly subcontractUtils = inject(SubcontractUtils);
  private readonly subcontractStateService = inject(SubcontractStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  @ViewChild(SubcontractComponent) subcontractComponent!: SubcontractComponent;
  subcontractId!: number;
  currentSubcontract!: Subcontract;

  visibleSubcontractModal: boolean = false;
  isLoadingDelete: boolean = false;
  isLoadingEdit = false;
  isDirty = false;
  isInvalid = false;

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

  public onSubcontractDeleteConfirm() {
    this.isLoadingDelete = true;
    if (this.currentSubcontract) {
      this.subcontractUtils.deleteSubcontract(this.currentSubcontract.id).subscribe({
        next: () => {
          this.isLoadingDelete = false;
          this.visibleSubcontractModal = false;
          this.commonMessageService.showDeleteSucessfullMessage();
          this.goBackListSubcontracts();
        },
        error: (error) => {
          this.isLoadingDelete = false;
          this.visibleSubcontractModal = false;
          this.handleDeleteError(error);
        }
      });
    }
  }

  private handleDeleteError(error: any) {
    if (error instanceof OccError || error?.message?.includes('404') || error?.errorType === 'DELETE_UNEXISTED') {
      this.commonMessageService.showErrorDeleteMessage();
      this.showOCCErrorModalSubcontract = true;
      this.errorType = 'DELETE_UNEXISTED';
      this.redirectRoute = "/customers/subcontracts/" + this.currentSubcontract.customer?.id;
    } else if (error instanceof HttpErrorResponse && error.status === 500 && error.error.message.includes('foreign key constraint')) {
        this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
      } else {
      this.commonMessageService.showErrorDeleteMessage();
    }
  }
}
