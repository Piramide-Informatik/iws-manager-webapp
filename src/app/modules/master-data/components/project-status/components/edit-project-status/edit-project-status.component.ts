import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'master-data-edit-project-status',
  standalone: false,
  templateUrl: './edit-project-status.component.html',
  styleUrl: './edit-project-status.component.scss'
})
export class EditProjectStatusComponent {

  editProjectStatusForm!: FormGroup;

  ngOnInit(): void {
    this.editProjectStatusForm = new FormGroup({
      projectStatus: new FormControl('Angebot', [Validators.required]),
    });
  }

  onSubmit(): void {
    console.log(this.editProjectStatusForm.value);
  }
}
