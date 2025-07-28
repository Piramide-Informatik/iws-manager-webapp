import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-subcontracts-details',
  standalone: false,
  templateUrl: './subcontracts-details.component.html',
  styleUrls: ['./subcontracts-details.component.scss'],
})
export class SubcontractsDetailsComponent implements OnInit {

  subcontractId!: number;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ){}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.subcontractId = params['subContractId'];
      if (this.subcontractId) {
        console.log("Edit Logic");
      } else {
        console.log("Create Logic")
      }
    })
  }

  goBackListSubcontracts(): void{
    const path = this.subcontractId ? '../../' : '../'
    this.router.navigate([path], { relativeTo: this.activatedRoute });
  }
}
