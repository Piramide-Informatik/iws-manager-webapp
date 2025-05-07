import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TypesOfCompaniesService } from '../../services/types-of-companies.service';
import { BusinessType } from '../../../../../../Entities/businessType';

@Component({
  selector: 'app-types-of-companies-form',
  standalone: false,
  templateUrl: './types-of-companies-form.component.html',
  styleUrl: './types-of-companies-form.component.scss'
})
export class TypesOfCompaniesFormComponent implements OnInit {

  companyType!: BusinessType;
  companyTypeForm!: FormGroup;

  constructor( private readonly typesOfCompaniesService: TypesOfCompaniesService ){ }

  ngOnInit(): void {
    this.companyTypeForm = new FormGroup({
      companyType: new FormControl('', [Validators.required])
    });
  }

  onSubmit(): void {
    if (this.companyTypeForm.valid) {
      console.log(this.companyTypeForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}