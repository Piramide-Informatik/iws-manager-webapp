import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-contract-details',
  standalone: false,
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss'
})
export class ContractDetailsComponent implements OnInit {

  ContractDetailsForm!: FormGroup;
  public customer!: string;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) { }

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

    this.activatedRoute.params
      .subscribe(params => {
        this.ContractDetailsForm.get('customer')?.setValue(history.state.customer);
        this.ContractDetailsForm.get('personalnr')?.setValue(history.state.workContract.employeeId);
        this.ContractDetailsForm.get('vorname')?.setValue(history.state.workContract.firstName);
        this.ContractDetailsForm.get('nachname')?.setValue(history.state.workContract.lastName);
        this.ContractDetailsForm.get('datum')?.setValue(history.state.workContract.startDate);
        this.ContractDetailsForm.get('gehalt')?.setValue(history.state.workContract.salaryPerMonth);
        this.ContractDetailsForm.get('wochenstunden')?.setValue(history.state.workContract.weeklyHours);
        this.ContractDetailsForm.get('gehalt')?.setValue(history.state.workContract.worksShortTime);
        this.ContractDetailsForm.get('wochenstunden')?.setValue(history.state.workContract.specialPayment);
        this.ContractDetailsForm.get('gehalt')?.setValue(history.state.workContract.maxHrspPerMonth);
        this.ContractDetailsForm.get('wochenstunden')?.setValue(history.state.workContract.maxHrsPerDay);
        this.ContractDetailsForm.get('wochenstunden')?.setValue(history.state.workContract.hourlyRate);
      })
  }

  goBackListContracts() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }
}
