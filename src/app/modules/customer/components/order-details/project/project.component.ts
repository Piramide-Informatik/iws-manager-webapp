import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';


@Component({
  selector: 'app-project',
  standalone: false,
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent {

  projectForm!: FormGroup;

  ngOnInit(): void {
    this.projectForm = new FormGroup({
      projectLabel: new FormControl('', [Validators.required]),
      projectId: new FormControl('', [Validators.required]),
      promoterId: new FormControl('', [Validators.required]),
      startDate: new FormControl('', [Validators.required]),
      endDate: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      console.log(this.projectForm.value);
    } else {
      console.log("Formulario no válido");
    }
  }
}
