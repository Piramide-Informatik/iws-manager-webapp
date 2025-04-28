import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Rol } from '../../../../../../Entities/rol';
import { SystemConstantService } from '../../services/system-constant.service';
import { System } from '../../../../../../Entities/system';

@Component({
  selector: 'app-system-constant-form',
  standalone: false,
  templateUrl: './system-constant-form.component.html',
  styleUrl: './system-constant-form.component.scss'
})
export class SystemConstantFormComponent implements OnInit {

  systemConstant!: System;
  editSystemConstantForm!: FormGroup;

   constructor( private readonly systemService: SystemConstantService ){ }

  ngOnInit(): void {
    this.editSystemConstantForm = new FormGroup({
      name: new FormControl('', [Validators.required]),
      valuenum: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      valuechar: new FormControl('', [Validators.pattern('^[a-zA-Z0-9]*$')]),
    });
  }

  onSubmit(): void {
    if (this.editSystemConstantForm.valid) {
      console.log(this.editSystemConstantForm);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}