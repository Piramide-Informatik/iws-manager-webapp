import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit{

  public orderForm!: FormGroup;

  ngOnInit(): void {
    this.initOrderForm();
  }

  private initOrderForm(): void {
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
      orderValue: new FormControl('', [Validators.required]),
      employeeiws: new FormControl('', [Validators.required]),
    });
    this.orderForm.get('orderId')?.disable();
  }

  onSubmit(): void {
    if (this.orderForm.valid) {
      console.log(this.orderForm.value);
    } else {
      console.log("Formulario no válido");
    }
  }
  forderprogrammOptions = [
    { label: 'Programm 1', value: 'programm1' },
    { label: 'Programm 2', value: 'programm2' },
    { label: 'Programm 3', value: 'programm3' }
];

vertragsstatusOptions = [
    { label: 'Aktiv', value: 'aktiv' },
    { label: 'Inaktiv', value: 'inaktiv' },
    { label: 'Ausstehend', value: 'ausstehend' }
];

iwsMitarbeiterOptions = [
    { label: 'Mitarbeiter 1', value: 'mitarbeiter1' },
    { label: 'Mitarbeiter 2', value: 'mitarbeiter2' },
    { label: 'Mitarbeiter 3', value: 'mitarbeiter3' }
];

}
