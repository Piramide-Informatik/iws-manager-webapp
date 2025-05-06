import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'master-data-edit-term-payment',
  standalone: false,
  templateUrl: './edit-term-payment.component.html',
  styleUrl: './edit-term-payment.component.scss'
})
export class EditTermPaymentComponent {
  public editTermPaymentForm!: FormGroup;

  ngOnInit(): void {
    this.editTermPaymentForm = new FormGroup({
      termsPayment: new FormControl('14 Tage', [Validators.required]),
      termPayment: new FormControl('14', [Validators.required]),
      invoiceText: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    console.log(this.editTermPaymentForm.value);
  }
}
