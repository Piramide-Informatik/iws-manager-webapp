import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss'],
  standalone: false
})
export class OrderDetailComponent implements OnInit {
  agreementId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.agreementId = this.route.snapshot.paramMap.get('id');
    // Aquí puedes cargar los datos del acuerdo usando el ID
    console.log('Agreement ID:', this.agreementId);
  }
}