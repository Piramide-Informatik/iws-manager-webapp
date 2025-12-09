import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-employee-absences',
  standalone: false,
  templateUrl: './employee-absences.component.html',
  styleUrl: './employee-absences.component.scss'
})
export class EmployeeAbsencesComponent implements OnInit {

  formYearEmployee!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.formYearEmployee = new FormGroup ({
      year: new FormControl(''),
      employeeno: new FormControl(),
      employeeFullName: new FormControl({ value: '', disabled: true })
    })
  }
}
