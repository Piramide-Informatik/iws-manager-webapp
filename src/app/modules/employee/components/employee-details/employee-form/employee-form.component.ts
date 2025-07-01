import { Component, inject, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SalutationService } from '../../../../../Services/salutation.service';
import { Title } from '../../../models/title';
import { QualificationFZ } from '../../../models/qualification-fz';
import { Router, ActivatedRoute } from '@angular/router';

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
}
