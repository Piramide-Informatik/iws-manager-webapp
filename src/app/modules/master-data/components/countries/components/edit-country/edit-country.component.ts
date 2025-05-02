import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-edit-country',
  standalone: false,
  templateUrl: './edit-country.component.html',
  styleUrl: './edit-country.component.scss',
})
export class EditCountryComponent implements OnInit {
  countryForm!: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.countryForm = this.fb.group({
      name: ['Niederlande'],
      abbreviation: ['NL'],
      isStandard: [false],
    });
  }

  saveCountry(): void {
    const formData = this.countryForm.value;
    console.log('Saving Country:', formData);
  }

  cancelEdit(): void {
    this.countryForm.reset();
  }
}
