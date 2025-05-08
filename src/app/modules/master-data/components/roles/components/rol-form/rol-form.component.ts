import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
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

  public editRolForm!: FormGroup;

  constructor( private readonly rolService: RolesService ){ }

  ngOnInit(): void {
    this.editRolForm = new FormGroup({
      stateName: new FormControl('', [Validators.required]),
      selectedModule: new FormControl('', [Validators.required])
    });

    this.roles = this.rolService.list();
  }

  onSubmit(): void {
    console.log(this.editRolForm.value); 
  }
}
