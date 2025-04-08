import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-iws-provision',
  standalone: false,
  templateUrl: './iws-provision.component.html',
  styleUrl: './iws-provision.component.scss'
})
export class IwsProvisionComponent implements OnInit{
  iwsEmployeeForm!: FormGroup;

  ngOnInit(): void {
    this.iwsEmployeeForm = new FormGroup({
      fixCommission: new FormControl('', [Validators.required]),
      maxCommission: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.iwsEmployeeForm.valid) {
      console.log(this.iwsEmployeeForm.value);
    } else {
      console.log("Formulario no válido");
    }
  }

}
