import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { Project } from '../../../../../../Entities/project';
import { ProjectStateService } from '../../../../utils/project-state.service';
import { ProjectUtils } from '../../../../../customer/sub-modules/projects/utils/project.utils';
import { Subscription } from 'rxjs';
import { ExcelImportRow } from '../../../../../../Entities/excelImportRow';
import { ValidationResult } from '../../../../../../Entities/validationResult';
import * as XLSX from 'xlsx';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-work-packages',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    ButtonModule, 
    TranslatePipe, 
    InputTextModule,
    ToastModule,
    DialogModule,
    InputNumberModule
  ],
  providers: [MessageService],
  templateUrl: './work-packages.component.html',
  styleUrls: ['./work-packages.component.scss']
})
export class WorkPackagesComponent implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly projectStateService = inject(ProjectStateService);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly messageService = inject(MessageService);
  private readonly subscriptions: Subscription = new Subscription();
  private readonly titleService = inject(Title);
  private readonly translate = inject(TranslateService);

  projectId: string = '';
  currentProjectId!: number;
  currentProject!: Project | null;
  editingRowIndex: number | null = null;
  isLoading = false;
  showConfirmDialog = false;
  pendingImportData: ExcelImportRow[] = [];

  //Valid project data (for validation)
  validWorkPackages: string[] = ['AP1', 'AP2', 'AP3'];
  validEmployees: string[] = ['ABC123', 'DEF456', 'GHI789'];

  rows: any[] = [
    {
      ap: 'Ermittlung und Analyse',
      apNr: 'AP1',
      persNr: ['ABC123', 'DEF456', 'GHI789'],
      pmBewilligt: [1.5, 2.5, 0.75],
      persKostenBewilligt: [1250, 9500, 6500],
      pmGeplant: [1.5, 2.5, 0.75],
      stdGeplant: [240, 400, 120],
      persKostenGeplant: [9500, 6500, 3000],
      stdAbgerechnet: [880, 400, 3000],
      persKostenAbgerechnet: [6500, 3000, 1500],
      pmVerfuegbar: [2.5, 400, 1500],
      stdVerfuegbar: [400, 1500, 1500],
      persKostenVerfuegbar: [3000, 1500, 1500],
    }
  ];

  ngOnInit() {
    const routeSub = this.activatedRoute.paramMap.subscribe(params => {
      this.projectId = params.get('idProject') || '';
      this.currentProjectId = Number(this.projectId);
      this.loadProject();
    });
    this.subscriptions.add(routeSub);
    
    this.titleService.setTitle(`${this.translate.instant('PAGETITLE.PROJECT.PROJECT_WORK_PACKAGE_EMPLOYEE')}`);
    this.subscriptions.add(
      this.translate.onLangChange.subscribe(() => {
        this.titleService.setTitle(`${this.translate.instant('PAGETITLE.PROJECT.PROJECT_WORK_PACKAGE_EMPLOYEE')}`);
      })
    );
  }

  private loadProject(): void {
    const projectSub = this.projectStateService.currentProject$.subscribe(project => {
      if(project && project.id === this.currentProjectId) {
        this.currentProject = project;
        this.loadValidProjectData();
      } else {
        this.projectUtils.getProjectById(this.currentProjectId).subscribe(proj => {
          if(proj) {
            this.currentProject = proj;
            this.projectStateService.setProjectToEdit(proj);
            this.loadValidProjectData();
          }
        });
      }
    });
    this.subscriptions.add(projectSub);
  }

  private loadValidProjectData(): void {
    // Load valid work packages and employees from the backend
    // For now, use mock data
  }

  /**
   * Handles the selection of an Excel file
   */
  async onFileSelected(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  this.isLoading = true;

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Validate and process
    const validationResult = this.validateExcelData(jsonData);
    
    // Handle errors first and exit
    if (!validationResult.valid) {
      this.showValidationErrors(validationResult.errors);
      return;
    }

    // If we get here, validation passed
    if (validationResult.warnings.length > 0) {
      this.showValidationWarnings(validationResult.warnings);
    }

    // Check if there are existing data
    if (this.hasExistingData(validationResult.data)) {
      this.pendingImportData = validationResult.data;
      this.showConfirmDialog = true;
    } else {
      this.importData(validationResult.data);
    }
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Error to process the Excel file';
    
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage
    });
    console.error('Error processing Excel file:', error);
  } finally {
    this.isLoading = false;
    input.value = ''; // Reset input
  }
}

  /**
   * Validates the Excel data
   */
  private validateExcelData(jsonData: any[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const data: ExcelImportRow[] = [];

    // Check for headers
    if (jsonData.length < 2) {
      errors.push('The file must contain headers and at least one data row');
      return { valid: false, errors, warnings, data };
    }

    // Validate column structure (expects: Nr. Arbeitspaket, Pers. Nr., PM)
    const headers = jsonData[0];
    const expectedHeaders = ['Nr. Arbeitspaket', 'Pers. Nr.', 'PM'];
    
    if (!this.validateHeaders(headers, expectedHeaders)) {
      errors.push(`The file must have the columns: ${expectedHeaders.join(', ')}`);
      return { valid: false, errors, warnings, data };
    }

    // Process each data row
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      if (!row || row.length < 3) continue;

      const workPackageNumber = String(row[0]).trim();
      const employeeNumber = String(row[1]).trim();
      const personMonths = Number.parseFloat(row[2]);

      // Validate work package number
      if (!this.validWorkPackages.includes(workPackageNumber)) {
        errors.push(`Row ${i + 1}: Invalid work package number "${workPackageNumber}"`);
        continue;
      }

      // Validate employee number
      if (!this.validEmployees.includes(employeeNumber)) {
        errors.push(`Row ${i + 1}: Invalid employee number "${employeeNumber}"`);
        continue;
      }

      // Validate person months
      if (Number.isNaN(personMonths) || personMonths < 0) {
        errors.push(`Row ${i + 1}: Invalid person months "${row[2]}"`);
        continue;
      }

      data.push({
        workPackageNumber,
        employeeNumber,
        personMonths
      });
    }

    if (data.length === 0 && errors.length === 0) {
      errors.push('No valid data found to import');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      data
    };
  }

  private validateHeaders(actual: any[], expected: string[]): boolean {
    if (actual.length < expected.length) return false;
    
    for (let i = 0; i < expected.length; i++) {
      if (String(actual[i]).trim() !== expected[i]) {
        return false;
      }
    }
    return true;
  }

  /**
   * Checks if there are existing data for the period
   */
  private hasExistingData(importData: ExcelImportRow[]): boolean {
    // Implement real logic to verify with backend
    // For now returns false to simplify
    return false;
  }

  /**
   * Imports the validated data and updates the table structure
   */
  private importData(data: ExcelImportRow[]): void {
    this.isLoading = true;

    // Group data by work package
    const groupedData = this.groupByWorkPackage(data);

    // Update or create rows
    groupedData.forEach(group => {
      let rowIndex = this.rows.findIndex(r => r.apNr === group.workPackageNumber);
      
      if (rowIndex === -1) {
        // Create new row if it doesn't exist
        const newRow = {
          ap: `Paquete ${group.workPackageNumber}`,
          apNr: group.workPackageNumber,
          persNr: [],
          pmBewilligt: [],
          persKostenBewilligt: [],
          pmGeplant: [],
          stdGeplant: [],
          persKostenGeplant: [],
          pmAbgerechnet: [],
          stdAbgerechnet: [],
          persKostenAbgerechnet: [],
          pmVerfuegbar: [],
          stdVerfuegbar: [],
          persKostenVerfuegbar: [],
        };
        this.rows.push(newRow);
        rowIndex = this.rows.length - 1;
      }

      const row = this.rows[rowIndex];

      // Process each employee in the group
      group.employees.forEach(emp => {
        let persIndex = row.persNr.indexOf(emp.employeeNumber);
        
        if (persIndex === -1) {
          // Add new employee to the work package
          row.persNr.push(emp.employeeNumber);
          row.pmBewilligt.push(emp.personMonths);
          row.persKostenBewilligt.push(0);
          row.pmGeplant.push(0);
          row.stdGeplant.push(0);
          row.persKostenGeplant.push(0);
          row.pmAbgerechnet.push(0);
          row.stdAbgerechnet.push(0);
          row.persKostenAbgerechnet.push(0);
          row.pmVerfuegbar.push(0);
          row.stdVerfuegbar.push(0);
          row.persKostenVerfuegbar.push(0);
        } else {
          // Update existing employee
          row.pmBewilligt[persIndex] = emp.personMonths;
        }
      });

      // Recalculate values for this work package
      this.calculateValues(rowIndex);
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: `Imported ${data.length} records successfully`
    });

    this.isLoading = false;
  }

  /**
   * Groups imported data by work package
   */
  private groupByWorkPackage(data: ExcelImportRow[]): Array<{
    workPackageNumber: string;
    employees: Array<{ employeeNumber: string; personMonths: number }>;
  }> {
    const grouped = new Map<string, Array<{ employeeNumber: string; personMonths: number }>>();

    data.forEach(item => {
      if (!grouped.has(item.workPackageNumber)) {
        grouped.set(item.workPackageNumber, []);
      }
      grouped.get(item.workPackageNumber)!.push({
        employeeNumber: item.employeeNumber,
        personMonths: item.personMonths
      });
    });

    return Array.from(grouped.entries()).map(([workPackageNumber, employees]) => ({
      workPackageNumber,
      employees
    }));
  }

  /**
   * Confirm the import when there is existing data.
   */
  confirmImport(): void {
    this.showConfirmDialog = false;
    this.importData(this.pendingImportData);
    this.pendingImportData = [];
  }

  /**
   * Cancel the import
   */
  cancelImport(): void {
    this.showConfirmDialog = false;
    this.pendingImportData = [];
  }

  private showValidationErrors(errors: string[]): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Validation Errors',
      detail: errors.join('\n'),
      life: 10000
    });
  }

  private showValidationWarnings(warnings: string[]): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Warnings',
      detail: warnings.join('\n'),
      life: 5000
    });
  }

  addRow() {
    const newApNumber = `AP${this.rows.length + 1}`;
    this.rows.push({
      ap: 'NEW WORK PACKAGE',
      apNr: newApNumber,
      persNr: ['EMPLOYEE1'], // You can add more employees later
      pmBewilligt: [0],
      persKostenBewilligt: [0],
      pmGeplant: [0],
      stdGeplant: [0],
      persKostenGeplant: [0],
      pmAbgerechnet: [0],
      stdAbgerechnet: [0],
      persKostenAbgerechnet: [0],
      pmVerfuegbar: [0],
      stdVerfuegbar: [0],
      persKostenVerfuegbar: [0],
    });
    this.editingRowIndex = this.rows.length - 1;
    
    this.messageService.add({
      severity: 'info',
      summary: 'New Work Package',
      detail: `New Work Package added: ${newApNumber}`
    });
  }

  calculateValues(index: number) {
    const row = this.rows[index];
    
    // Calculate for each employee in the work package
    for (let i = 0; i < row.persNr.length; i++) {
      const pmBew = row.pmBewilligt[i] || 0;
      const pmGepl = row.pmGeplant[i] || 0;
      const persKostenBew = row.persKostenBewilligt[i] || 0;
      const persKostenGepl = row.persKostenGeplant[i] || 0;
      
      // Automatic calculation: Std Geplant = PM Geplant × 160
      row.stdGeplant[i] = pmGepl * 160;
      
      // Calculation of PM Available = PM Approved - PM Planned
      row.pmVerfuegbar[i] = Math.max(0, pmBew - pmGepl);
      
      // Calculation of Std Available = (PM Approved × 160) - Std Planned
      row.stdVerfuegbar[i] = Math.max(0, (pmBew * 160) - row.stdGeplant[i]);
      
      // Calculation of Pers. Cost Available = Pers. Cost Approved - Pers. Cost Planned
      row.persKostenVerfuegbar[i] = Math.max(0, persKostenBew - persKostenGepl);
    }

    // Auto-save changes (backend call)
    this.autoSaveChanges(index);
  }

  /**
   * Automatically save changes to the backend
   */
  private autoSaveChanges(index: number): void {
    // Implement backend call
    // Debounce to prevent multiple rapid calls
    
    // NOSONAR - Example:
    // const row = this.rows[index];
    // this.workPackageService.updateWorkPackage(row).subscribe({
    //   next: () => console.log('Guardado automático exitoso'),
    //   error: (err) => this.messageService.add({
    //     severity: 'error',
    //     summary: 'Error',
    //     detail: 'No se pudo guardar automáticamente'
    //   })
    // });
  }

  formatNumber(value: any): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const num = Number(value);

    if (Number.isNaN(num)) {
      return '';
    }

    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  }

  
  onInputChange() {
    if (this.editingRowIndex !== null) {
      this.calculateValues(this.editingRowIndex);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}