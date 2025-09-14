import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Text } from '../../../../../../Entities/text';

@Component({
  selector: 'app-text-form',
  standalone: false,
  templateUrl: './text-form.component.html',
  styleUrl: './text-form.component.scss'
})
export class TextFormComponent implements OnInit {

  text!: Text;
  editTextForm!: FormGroup;

  ngOnInit(): void {
    this.editTextForm = new FormGroup({
      label: new FormControl({value: '', disabled: true}),
      text: new FormControl('', [Validators.required])
    });
  }

  onSubmit(): void {
    if (this.editTextForm.valid) {
      console.log(this.editTextForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}