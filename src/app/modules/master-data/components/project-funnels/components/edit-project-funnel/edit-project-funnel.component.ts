import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'master-data-edit-project-funnel',
  standalone: false,
  templateUrl: './edit-project-funnel.component.html',
  styleUrl: './edit-project-funnel.component.scss'
})
export class EditProjectFunnelComponent {

  public editProjectFunnelForm!: FormGroup;
  public lands: any[]= [{name: 'Deutschland'},{name: 'Frankreich'},{name: 'Spanien'},{name: 'Italien'},{name: 'Japan'}];

  ngOnInit(): void {
    this.editProjectFunnelForm = new FormGroup({
      projectSponsorId: new FormControl('1601', [Validators.required]),
      abbreviation: new FormControl('DLR', [Validators.required]),
      name1: new FormControl('Deutsches Zentrum für Luft- und Raumfahrt e.V.', [Validators.required]),
      name2: new FormControl('', [Validators.required]),
      land: new FormControl(this.lands[0], [Validators.required]),
      street: new FormControl('', [Validators.required]),
      zip: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    console.log(this.editProjectFunnelForm.value);
  }
}
