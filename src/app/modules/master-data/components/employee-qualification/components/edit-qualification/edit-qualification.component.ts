import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-qualification',
  standalone: false,
  templateUrl: './edit-qualification.component.html',
  styleUrl: './edit-qualification.component.scss'
})
export class EditQualificationComponent {
  editQualificationForm!: FormGroup;

  ngOnInit(): void {
    this.editQualificationForm = new FormGroup({
      qualification: new FormControl('', [Validators.required]),
      abbreviation: new FormControl('', [Validators.required])
    });
  }
}
