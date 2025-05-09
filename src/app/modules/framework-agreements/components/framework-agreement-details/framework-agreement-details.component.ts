import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-framework-agreement-details',
  templateUrl: './framework-agreement-details.component.html',
  styleUrls: ['./framework-agreement-details.component.scss'],
  standalone: false
})
export class FrameworkAgreementsDetailsComponent implements OnInit {
  agreementId: string | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router

  ) {}

  ngOnInit(): void {
    this.agreementId = this.route.snapshot.paramMap.get('id');
  }

  goBackFrameworksAgreement() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}