import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SubcontractComponent } from './subcontract/subcontract.component';

@Component({
  selector: 'app-subcontracts-details',
  standalone: false,
  templateUrl: './subcontracts-details.component.html',
  styleUrls: ['./subcontracts-details.component.scss'],
})
export class SubcontractsDetailsComponent implements OnInit {
  @ViewChild(SubcontractComponent) subcontractComponent!: SubcontractComponent;
  subcontractId!: number;

  isLoading: boolean = false;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ){}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.subcontractId = params['subContractId'];
    })
  }

  onSubmit(): void {
    this.subcontractComponent.onSubmit();
  }

  goBackListSubcontracts(): void{
    const path = this.subcontractId ? '../../' : '../'
    this.router.navigate([path], { relativeTo: this.activatedRoute });
  }

  setLoadingOperation(loading: boolean): void {
    this.isLoading = loading;
  }
}
