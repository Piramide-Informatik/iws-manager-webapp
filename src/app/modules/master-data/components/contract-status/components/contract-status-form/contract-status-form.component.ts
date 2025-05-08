import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContractStatusService } from '../../services/contract-status.service'
import { ContractStatus } from '../../../../../../Entities/contractStatus';

@Component({
  selector: 'app-contract-status-form',
  standalone: false,
  templateUrl: './contract-status-form.component.html',
  styleUrl: './contract-status-form.component.scss'
})
export class ContractStatusFormComponent implements OnInit {

  contractStatus!: ContractStatus;
  contractStatusForm!: FormGroup;

  constructor( private readonly contractStatusService: ContractStatusService ){ }

  ngOnInit(): void {
    this.contractStatusForm = new FormGroup({
      contractStatus: new FormControl('', [Validators.required])
    });
  }

  onSubmit(): void {
    if (this.contractStatusForm.valid) {
      console.log(this.contractStatusForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}