import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-subcontracts-details',
  standalone: false,
  templateUrl: './subcontracts-details.component.html',
  styleUrls: ['./subcontracts-details.component.scss'],
})
export class SubcontractsDetailsComponent {

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ){}

  goBackListSubcontracts(): void{
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }
}
