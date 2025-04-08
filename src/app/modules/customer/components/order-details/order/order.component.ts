import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit{

  orderForm!: FormGroup;

  ngOnInit(): void {
    this.orderForm = new FormGroup({
      orderId: new FormControl('', [Validators.required]),
      orderLabel: new FormControl('', [Validators.required]),
      orderType: new FormControl('', [Validators.required]),
      customerId: new FormControl('', [Validators.required]),
      customerName: new FormControl('', [Validators.required]),
      acronym: new FormControl('', [Validators.required]),
      orderTitle: new FormControl('', [Validators.required]),
      orderDate: new FormControl('', [Validators.required]),
      fundingProgram: new FormControl('', [Validators.required]),
      contractStatus: new FormControl('', [Validators.required]),
      approvalDate: new FormControl('', [Validators.required]),
      contractTitle: new FormControl('', [Validators.required]),
      employeeiws: new FormControl('', [Validators.required]),
      orderValue: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      console.log(this.orderForm.value);
    } else {
      console.log("Formulario no válido");
    }
  }
}
