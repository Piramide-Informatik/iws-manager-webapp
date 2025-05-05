import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'master-data-edit-realization-probabilities',
  standalone: false,
  templateUrl: './edit-realization-probabilities.component.html',
  styleUrl: './edit-realization-probabilities.component.scss'
})
export class EditRealizationProbabilitiesComponent implements OnInit {
  editProbablitiesForm!: FormGroup;

  ngOnInit(): void {
    this.editProbablitiesForm = new FormGroup({
      probability: new FormControl('75', [Validators.required])
    });
  }

  onSubmit(): void {
    console.log(this.editProbablitiesForm.value);
  }
}
