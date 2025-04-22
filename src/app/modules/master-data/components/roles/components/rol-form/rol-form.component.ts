import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Rol } from '../../../../../../Entities/rol';
import { RolesService } from '../../services/roles.service';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
}

@Component({
  selector: 'app-rol-form',
  standalone: false,
  templateUrl: './rol-form.component.html',
  styleUrl: './rol-form.component.scss'
})
export class RolFormComponent implements OnInit{

  selectedOrderCommission!: null;
  roles: Rol[] = [];

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  cols!: Column[];


  public modules: any[] = [
    { name: 'Modul 1', code: 'M1' },
    { name: 'Modul 2', code: 'M2' },
    { name: 'Modul 3', code: 'M3' }
  ]

  editStateForm!: FormGroup;

   constructor( private rolService: RolesService ){ }

  ngOnInit(): void {
    this.editStateForm = new FormGroup({
      absenceType: new FormControl('', [Validators.required]),
      absenceTypeLabel: new FormControl('', [Validators.required]),
      shareOfDay: new FormControl('', [Validators.required]),
    });

    this.roles = this.rolService.list();
  }

  onSubmit(): void {
    if (this.editStateForm.valid) {
      console.log(this.editStateForm.value);
    } else {
      console.log("Ungültiges Formular");
    }
  }
}
