import { Component, OnInit } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { WorkContractsService } from '../../services/work-contracts.service';

@Component({
  selector: 'app-list-work-contracts',
  standalone: false,
  templateUrl: './list-work-contracts.component.html',
  styleUrl: './list-work-contracts.component.scss',
})
export class ListWorkContractsComponent implements OnInit {
  products!: WorkContract[];

  constructor(private workContractsService: WorkContractsService) {}

  ngOnInit() {
    this.workContractsService.list().then((data) => {
      this.products = data;
    });
  }
}
