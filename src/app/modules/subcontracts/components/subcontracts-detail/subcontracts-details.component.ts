import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubcontractComponent } from './subcontract/subcontract.component';
import { SubcontractUtils } from '../../utils/subcontracts-utils';
import { Subcontract } from '../../../../Entities/subcontract';
import { CommonMessagesService } from '../../../../Services/common-messages.service';

@Component({
  selector: 'app-subcontracts-details',
  standalone: false,
  templateUrl: './subcontracts-details.component.html',
  styleUrls: ['./subcontracts-details.component.scss'],
})
export class SubcontractsDetailsComponent implements OnInit {
  private readonly subcontractUtils = inject(SubcontractUtils);
  private readonly commonMessageService = inject(CommonMessagesService);
  @ViewChild(SubcontractComponent) subcontractComponent!: SubcontractComponent;
  subcontractId!: number;
  visibleSubcontractModal: boolean = false;
  isLoading: boolean = false;
  public currentSubcontract!: Subcontract | undefined;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ){}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.subcontractId = params['subContractId'];
      this.subcontractUtils.getSubcontractById(this.subcontractId).subscribe(subcontract => {
        this.currentSubcontract = subcontract;
      });
    });
  }

  onSubmit(): void {
    this.subcontractComponent.onSubmit();
  }

  goBackListSubcontracts(): void{
    const path = this.subcontractId ? '../../' : '../'
    this.router.navigate([path], { relativeTo: this.activatedRoute });
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
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
  }
}
