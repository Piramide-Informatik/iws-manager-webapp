import { Component, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-subcontract',
  standalone: false,
  templateUrl: './subcontract.component.html',
  styleUrls: ['./subcontract.component.scss'],
})
export class SubcontractComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private langSubscription!: Subscription;
  public subcontractForm!: FormGroup;

  public optionsNetOrGross!: { label: string, value: string }[];

  ngOnInit(): void {
    this.loadOptionsInvoiceLabel();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadOptionsInvoiceLabel();
    });

    this.initForm();

    this.checkboxAfaChange();
  }

  private initForm(): void {
    this.subcontractForm = new FormGroup({
      customer: new FormControl(''),
      order: new FormControl(''),
      contractor: new FormControl(''),
      invoiceNumber: new FormControl(''),
      invoiceDate: new FormControl(''),
      netOrGross: new FormControl(this.optionsNetOrGross[0].value), // default: 'net'
      invoiceAmount: new FormControl(''),
      afa: new FormControl(false), // checkbox
      afaDurationMonths: new FormControl({ value: '', disabled: true }), // solo si afa = true
      description: new FormControl(''),
    });
  }

  checkboxAfaChange(): void {
    this.subcontractForm.get('afa')?.valueChanges.subscribe((value: boolean) => {
      const afaDurationControl = this.subcontractForm.get('afaDurationMonths');
      if (value) {
        afaDurationControl?.enable();
      } else {
        afaDurationControl?.disable();
        afaDurationControl?.setValue('');
      }
    });
  }

  loadOptionsInvoiceLabel(): void {
    this.optionsNetOrGross = [
      { label: this.translate.instant('SUB-CONTRACTS.FORM.NET'), value: 'net' },
      { label: this.translate.instant('SUB-CONTRACTS.FORM.GROSS'), value: 'gross' }
    ];
  }

  onSubmit(): void {
    if (this.subcontractForm.valid) {
      console.log(this.subcontractForm.value);
    } else {
      console.log('Formulario no válido');
    }
  }
}
