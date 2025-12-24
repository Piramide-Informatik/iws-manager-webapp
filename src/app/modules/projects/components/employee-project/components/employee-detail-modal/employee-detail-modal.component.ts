import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-employee-detail-modal',
  standalone: false,
  templateUrl: './employee-detail-modal.component.html',
  styleUrl: './employee-detail-modal.component.scss'
})
export class EmployeeDetailModalComponent implements OnInit, OnChanges {
  @Input() modalType: 'create' | 'edit' | 'delete' = 'create';
  @Input() visibleModal: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  isLoading = false;
  projectId = '';
  constructor(private readonly activatedRoute: ActivatedRoute) { }

  readonly createEmployeeDetailsForm = new FormGroup({
    employee: new FormControl(''),
    employeeNo: new FormControl<number | null>({ value: null, disabled: true }),
    hourlyrate: new FormControl(''),
    qualificationkmui: new FormControl('')
  });

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['idProject'];
    });
  }

  ngOnChanges(): void {

  }

  onSubmit(): void {
    if (this.createEmployeeDetailsForm.invalid || this.isLoading) return;

    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  closeAndReset(): void {
    this.isLoading = false;
    this.resetForm();
    this.isVisibleModal.emit(false);
  }

  resetForm(): void {
    this.createEmployeeDetailsForm.reset();
  }

  onCancel(): void {
    this.closeAndReset();
  }

  removeFromProject(): void {
    this.closeAndReset();
  }
}
