import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ← IMPORTANTE

@Component({
  selector: 'app-work-packages',
  standalone: true, // ← CAMBIA A true
  imports: [CommonModule, FormsModule], // ← IMPORTA MÓDULOS AQUÍ
  templateUrl: './work-packages.component.html',
  styleUrls: ['./work-packages.component.scss']
})
export class WorkPackagesComponent implements OnInit {

  projectId: string = '';
  testMessage: string = '';
  editingRowIndex: number | null = null;

  rows: any[] = [
    {
      ap: 'Ermittlung und Analyse',
      apNr: 'AP1',
      persNr: 'ABC123',
      pmBewilligt: 10.5,
      persKostenBewilligt: 12500,
      pmGeplant: 8.1,
      stdGeplant: 1280,
      persKostenGeplant: 9500,
      pmAbgerechnet: 5.5,
      stdAbgerechnet: 880,
      persKostenAbgerechnet: 6500,
      pmVerfuegbar: 2.5,
      stdVerfuegbar: 400,
      persKostenVerfuegbar: 3000,
    },
  ];

  constructor(private readonly activatedRoute: ActivatedRoute) { }

  addRow() {
    this.rows.push({
      ap: 'Nuevo AP',
      apNr: `AP${this.rows.length + 1}`,
      persNr: 'PERS' + (this.rows.length + 1),
      pmBewilligt: 0,
      persKostenBewilligt: 0,
      pmGeplant: 0,
      stdGeplant: 0,
      persKostenGeplant: 0,
      pmAbgerechnet: 0,
      stdAbgerechnet: 0,
      persKostenAbgerechnet: 0,
      pmVerfuegbar: 0,
      stdVerfuegbar: 0,
      persKostenVerfuegbar: 0,
    });
    this.editingRowIndex = this.rows.length - 1;
  }

  removeRow(index: number) {
    if (confirm('¿Está seguro de eliminar esta fila?')) {
      this.rows.splice(index, 1);
    }
  }

  startEdit(index: number) {
    this.editingRowIndex = index;
  }

  saveRow(index: number) {
    this.calculateValues(index);
    this.editingRowIndex = null;
  }

  calculateValues(index: number) {
    const row = this.rows[index];
    row.pmVerfuegbar = (row.pmBewilligt || 0) - (row.pmGeplant || 0);
    row.stdVerfuegbar = ((row.pmBewilligt || 0) * 160) - (row.stdGeplant || 0);
    row.persKostenVerfuegbar = (row.persKostenBewilligt || 0) - (row.persKostenGeplant || 0);

    if (row.pmVerfuegbar < 0) row.pmVerfuegbar = 0;
    if (row.stdVerfuegbar < 0) row.stdVerfuegbar = 0;
    if (row.persKostenVerfuegbar < 0) row.persKostenVerfuegbar = 0;
  }

  formatNumber(value: any): string {
    if (value === null || value === undefined || value === '') return '0.00';
    const num = Number(value);
    return Number.isNaN(num) ? '0.00' : num.toFixed(2);
  }

  onInputChange() {
    if (this.editingRowIndex !== null) {
      this.calculateValues(this.editingRowIndex);
    }
  }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      this.projectId = params.get('idProject') || '';
      this.testMessage = `✅ Ruta work-packages funcionando! Project ID: ${this.projectId}`;
    });
  }
}