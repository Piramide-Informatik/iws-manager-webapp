import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-iws-commissions',
  standalone: false,
  templateUrl: './edit-iws-commissions.component.html',
  styleUrl: './edit-iws-commissions.component.scss',
})
export class EditIwsCommissionsComponent implements OnInit {
  editCommissionForm!: FormGroup;

  @Input() selectedCommission: any = {
    threshold: 0,
    percentage: 0,
    minCommission: 0,
  };

  @Output() save = new EventEmitter<any>();
  @Output() cancel = new EventEmitter<void>();

  ngOnInit(): void {
    this.editCommissionForm = new FormGroup({
      threshold: new FormControl(this.selectedCommission.threshold, [
        Validators.required,
      ]),
      percentage: new FormControl(this.selectedCommission.percentage, [
        Validators.required,
      ]),
      minCommission: new FormControl(this.selectedCommission.minCommission, [
        Validators.required,
      ]),
    });
  }

  onSubmit(): void {
    if (this.editCommissionForm.valid) {
      const updatedCommission = {
        ...this.selectedCommission,
        ...this.editCommissionForm.value,
      };
      this.save.emit(updatedCommission);
    } else {
      console.log('Formular ungültig');
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
