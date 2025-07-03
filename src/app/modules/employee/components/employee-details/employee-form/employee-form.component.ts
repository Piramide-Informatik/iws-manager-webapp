import { Component, inject, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SalutationService } from '../../../../../Services/salutation.service';
import { Title } from '../../../models/title';
import { QualificationFZ } from '../../../models/qualification-fz';
import { Router, ActivatedRoute } from '@angular/router';
import { EmployeeUtils } from '../../../utils/employee.utils';
import { Employee } from '../../../../../Entities/employee';

@Component({
  selector: 'app-employee-form',
  standalone: false,
  templateUrl: './employee-form.component.html',
  styleUrl: './employee-form.component.scss'
})
export class EmployeeFormComponent {

  @Input() employeeNumber!: string | undefined;
  @Input() titleId!: string | undefined;
  @Input() employeeFirstName!: string | undefined;
  @Input() employeeLastName!: string | undefined;
  @Input() employeeEmail!: string;
  @Input() generalManagerSinceDate!: string;
  @Input() shareholderSinceDate!: string;
  @Input() solePropietorSinceDate!: string;
  @Input() coentrepreneurSinceDate!: string;
  qualificationsFZ: QualificationFZ[] | undefined;
  @Input() qualificationFzId!: string;
  @Input() qualificationKMUi!: string;

  public showOCCErrorModaEmployee = false;
  employeUtils = inject(EmployeeUtils);
  titles: Title[] | undefined;
  private readonly salutationService = inject(SalutationService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  public salutations = toSignal(
    this.salutationService.getAllSalutations().pipe(
      map(salutations => salutations.map(salutation => ({
        name: salutation.name,
        code: salutation.id
      })))
    ),
    { initialValue: [] }
  );

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  onSubmit(): void {
    const formData: Employee = {
      id: 0,
      version: 1,
      firstName: 'testFirstName',
      lastName: 'testLastName',
      email: 'test@mail.com',
      salutation: 'testSalutation',
      title: 'testTitle',
      generalManagerSince: 'testGm',
      shareholderSince: 'testShare',
      soleProprietorSince: 'testSole',
      coEntrepreneurSince: 'testCoen',
      qualificationFz: 'testQualificationFz',
      qualificationKmui: 'testQualificationKmui'
    };
    this.employeUtils.updateEmployee(formData).subscribe({
      next: (savedEmployee) => this.handleUpdateEmployeeSuccess(savedEmployee),
      error: (err) => this.handleUpdateEmployeeError(err)
    })
  }

  private handleUpdateEmployeeError(err: any): void {
    if (err.message === 'Conflict detected: employee person version mismatch') {
      this.showOCCErrorModaEmployee = true;
    }
  }

  private handleUpdateEmployeeSuccess(savedEmployee: Employee): void {
    // Add logic when the employee is upated
  }
}
