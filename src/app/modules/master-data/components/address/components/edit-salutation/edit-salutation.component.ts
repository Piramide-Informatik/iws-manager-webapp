import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'master-data-edit-salutation',
  standalone: false,
  templateUrl: './edit-salutation.component.html',
  styleUrl: './edit-salutation.component.scss'
})
export class EditSalutationComponent implements OnInit {
  editSalutationForm!: FormGroup;

  ngOnInit(): void {
    this.editSalutationForm = new FormGroup({
      salutation: new FormControl('Frau', [Validators.required])
    });
  }

  onSubmit(): void {
    if (this.editSalutationForm.valid) {
      console.log(this.editSalutationForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }

}
