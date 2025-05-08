import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { BillingMethodService } from '../../services/billing-method.service';
import { BillingType } from '../../../../../../Entities/billingType';

@Component({
  selector: 'app-billing-methods-form',
  standalone: false,
  templateUrl: './billing-methods-form.component.html',
  styleUrl: './billing-methods-form.component.scss'
})
export class BillingMethodsFormComponent implements OnInit {

  billingType!: BillingType;
  billingMethodForm!: FormGroup;

  constructor( private readonly billingMethodService: BillingMethodService ){ }

  ngOnInit(): void {
    this.billingMethodForm = new FormGroup({
      invoiceType: new FormControl('', [Validators.required])
    });
  }

  onSubmit(): void {
    if (this.billingMethodForm.valid) {
      console.log(this.billingMethodForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}