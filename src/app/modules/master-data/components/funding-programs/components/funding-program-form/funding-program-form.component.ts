import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-edit-funding-program',
  standalone: false,
  templateUrl: './funding-program-form.component.html',
  styleUrls: ['./funding-program-form.component.scss'],
})
export class FundingProgramFormComponent {
  fundingForm: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.fundingForm = this.fb.group({
      name: [''],
      rate: [0],
      personnelRate: [0],
      researchShare: [0],
      productiveHours: [2080],
    });
  }

  saveFundingProgram() {
    const formData = this.fundingForm.value;
    console.log('Saving Funding Program:', formData);
  }

  cancelEdit() {
    console.log('Editing cancelled');
    this.fundingForm.reset({
      name: '',
      rate: 0,
      personnelRate: 0,
      researchShare: 0,
      productiveHours: 2080,
    });
  }
}
