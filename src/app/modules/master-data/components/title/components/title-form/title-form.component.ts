import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '../../../../../../Entities/title';
import { TitleService } from '../../../../../../Services/title.service';

@Component({
  selector: 'app-title-form',
  standalone: false,
  templateUrl: './title-form.component.html',
  styleUrl: './title-form.component.scss'
})
export class TitleFormComponent implements OnInit {

  title!: Title;
  editTitleForm!: FormGroup;

   constructor( private readonly titleService: TitleService ){ }

  ngOnInit(): void {
    this.editTitleForm = new FormGroup({
      title: new FormControl('', [Validators.required])
    });
  }

  onSubmit(): void {
    if (this.editTitleForm.valid) {
      console.log(this.editTitleForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}