import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-cost',
  standalone: false,
  templateUrl: './edit-cost.component.html',
  styleUrl: './edit-cost.component.scss',
})
export class EditCostComponent implements OnInit {
  costForm!: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.costForm = this.fb.group({
      name: [''],
      sort: [1],
    });
  }

  saveCost(): void {
    const formValue = this.costForm.value;
    console.log('Saving cost entry:', formValue);
    this.costForm.reset({ sort: 1 });
  }

  cancelEdit(): void {
    this.costForm.reset({ sort: 1 });
  }
}
