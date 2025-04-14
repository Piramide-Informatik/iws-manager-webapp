import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-subcontract',
  standalone: false,
  templateUrl: './subcontract.component.html',
  styleUrls: ['./subcontract.component.scss'],
})
export class SubcontractComponent implements OnInit {
  subcontractForm!: FormGroup;

  ngOnInit(): void {
    this.subcontractForm = new FormGroup({
      customer: new FormControl('', Validators.required),
      order: new FormControl('', Validators.required),
      contractor: new FormControl('', Validators.required),
      invoiceNumber: new FormControl('', Validators.required),
      invoiceDate: new FormControl('', Validators.required),
      netOrGross: new FormControl('net', Validators.required), // default: 'net'
      invoiceAmount: new FormControl('', Validators.required),
      afa: new FormControl(false), // checkbox
      afaDurationMonths: new FormControl({ value: '', disabled: true }), // solo si afa = true
      description: new FormControl(''),
    });

    this.subcontractForm.get('afa')?.valueChanges.subscribe((checked) => {
      const control = this.subcontractForm.get('afaDurationMonths');
      if (checked) {
        control?.enable();
      } else {
        control?.disable();
      }
    });
  }

  onSubmit(): void {
    if (this.subcontractForm.valid) {
      console.log(this.subcontractForm.value);
    } else {
      console.log('Formulario no válido');
    }
  }
}
