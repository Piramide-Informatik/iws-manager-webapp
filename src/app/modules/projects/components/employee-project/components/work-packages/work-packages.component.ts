import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { Project } from '../../../../../../Entities/project';
import { ProjectStateService } from '../../../../utils/project-state.service';
import { ProjectUtils } from '../../../../../customer/sub-modules/projects/utils/project.utils';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-work-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TranslatePipe, InputTextModule],
  templateUrl: './work-packages.component.html',
  styleUrls: ['./work-packages.component.scss']
})
export class WorkPackagesComponent implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly projectStateService = inject(ProjectStateService);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly subscriptions: Subscription = new Subscription();

  projectId: string = '';
  currentProjectId!: number;
  currentProject!: Project | null;
  testMessage: string = '';
  editingRowIndex: number | null = null;

  isLoading = false;

  rows: any[] = [
    {
      ap: 'Ermittlung und Analyse',
      apNr: 'AP1',
      persNr: [
        'ABC123',
        'DEF456',
        'GHI789',
      ],
      pmBewilligt: [
        1.5,
        2.5,
        0.75,
      ],
      persKostenBewilligt: [
        1250,
        9500,
        6500,
      ],
      pmGeplant: [
        1.5,
        2.5,
        0.75,
      ],
      stdGeplant: [
        240,
        400,
        120,
      ],
      persKostenGeplant: [
        9500,
        6500,
        3000,
      ],
      pmAbgerechnet: [
        1.5,
        2.5,
        0.75,
      ],
      stdAbgerechnet: [
        880,
        400,
        3000,
      ],
      persKostenAbgerechnet: [
        6500,
        3000,
        1500,
      ],
      pmVerfuegbar: [
        2.5,
        400,
        1500,
      ],
      stdVerfuegbar: [
        400,
        1500,
        1500,
      ],
      persKostenVerfuegbar: [
        3000,
        1500,
        1500,
      ],
    }
  ];

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
    // Si es null, undefined o string vacío → mostrar vacío
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const num = Number(value);

    // Si no es número válido → mostrar vacío
    if (Number.isNaN(num)) {
      return '';
    }

    // Mostrar con 2 decimales SOLO si hay valor real
    return num.toFixed(2);
  }

  onInputChange() {
    if (this.editingRowIndex !== null) {
      this.calculateValues(this.editingRowIndex);
    }
  }

  ngOnInit() {
    const routeSub = this.activatedRoute.paramMap.subscribe(params => {
      this.projectId = params.get('idProject') || '';
      this.currentProjectId = Number(this.projectId);
      this.testMessage = `✅ Ruta work-packages funcionando! Project ID: ${this.projectId}`;
      this.loadProject();
    });
    this.subscriptions.add(routeSub);
  }

  private loadProject(): void {
    const projectSub = this.projectStateService.currentProject$.subscribe(project => {
      if(project && project.id === this.currentProjectId) {
        this.currentProject = project;
      } else {
        this.projectUtils.getProjectById(this.currentProjectId).subscribe(proj => {
          if(proj) {
            this.currentProject = proj;
            this.projectStateService.setProjectToEdit(proj);
          }
        });
      }
    });
    this.subscriptions.add(projectSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}