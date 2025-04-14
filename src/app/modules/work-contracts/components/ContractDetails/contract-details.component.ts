import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-contract-details',
  standalone: false,
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss'
})
export class ContractDetailsComponent implements OnInit{

    ContractDetailsForm!: FormGroup;
    public customer!: string;

  ngOnInit(): void {
    this.ContractDetailsForm = new FormGroup({
      customer: new FormControl('', [Validators.required]),
      personalnr: new FormControl('', [Validators.required]),
      vorname: new FormControl('', [Validators.required]),
      nachname: new FormControl('', [Validators.required]),
      datum: new FormControl('', [Validators.required]),
      gehalt: new FormControl('', [Validators.required]),
      wochenstunden: new FormControl('', [Validators.required]),
      kurz: new FormControl('', [Validators.required]),
      jahresauszahlung: new FormControl('', [Validators.required]),
      maxstudenmonat: new FormControl('', [Validators.required]),
      maxstudentag: new FormControl('', [Validators.required]),
      stundensatz: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.ContractDetailsForm.valid) {
      console.log(this.ContractDetailsForm.value);
    } else {
      console.log("Formulario no válido");
    }
  }
}
