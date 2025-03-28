import { Component } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-employee-overview',
  standalone: false,
  templateUrl: './employee-overview.component.html',
  styleUrl: './employee-overview.component.scss'
})
export class EmployeeOverviewComponent {
  searchEmployee: FormGroup;

  constructor(){
    this.searchEmployee = new FormGroup({
      kunde: new FormControl('')
    });
  }
}
