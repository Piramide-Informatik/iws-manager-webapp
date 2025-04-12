import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-framework-agreement-details',
  templateUrl: './framework-agreement-details.component.html',
  styleUrls: ['./framework-agreement-details.component.scss'],
  standalone: false
})
export class FrameworkAgreementsDetailsComponent implements OnInit {
  agreementId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.agreementId = this.route.snapshot.paramMap.get('id');
    // Aquí puedes cargar los datos del acuerdo usando el ID
    console.log('Agreement ID:', this.agreementId);
  }
}