import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubcontractComponent } from './subcontract/subcontract.component';
import { SubcontractUtils } from '../../utils/subcontracts-utils';
import { Subcontract } from '../../../../Entities/subcontract';
import { Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-subcontracts-details',
  standalone: false,
  templateUrl: './subcontracts-details.component.html',
  styleUrls: ['./subcontracts-details.component.scss'],
})
export class SubcontractsDetailsComponent implements OnInit {
  private readonly subcontractUtils = inject(SubcontractUtils);
  private readonly subscriptions = new Subscription();
  @ViewChild(SubcontractComponent) subcontractComponent!: SubcontractComponent;
  subcontractId!: number;
  currentSubcontract!: Subcontract;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ){}

  ngOnInit(): void {
    const routeSub = this.activatedRoute.params.pipe(
      switchMap(params => {
      this.subcontractId = params['subContractId'];
      return this.subcontractUtils.getSubcontractById(this.subcontractId);
    })
    ).subscribe({
      next: (subcontract) => {
        if (subcontract) {
          this.currentSubcontract = subcontract;
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

  goBackListSubcontracts(): void{
    const path = this.subcontractId ? '../../' : '../'
    this.router.navigate([path], { relativeTo: this.activatedRoute });
  }
}
