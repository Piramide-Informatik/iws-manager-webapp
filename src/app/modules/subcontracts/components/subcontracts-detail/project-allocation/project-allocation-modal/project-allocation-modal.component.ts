import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SubcontractProject } from '../../../../../../Entities/subcontract-project';

@Component({
  selector: 'app-project-allocation-modal',
  standalone: false,
  templateUrl: './project-allocation-modal.component.html',
  styleUrl: './project-allocation-modal.component.scss'
})
export class ProjectAllocationModalComponent implements OnChanges {

  @Input() visible = false;
  @Input() modalType: 'create' | 'edit' | 'delete' = 'create';
  @Input() subcontractProject: SubcontractProject | null = null;
  @Input() isVisibleModal: boolean = false;

  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();
  @Output() isProjectAllocationVisibleModal = new EventEmitter<boolean>();
  @Output() onMessageOperation = new EventEmitter<{ severity: string, summary: string, detail: string }>()
  @Output() SubcontractProjectUpdated = new EventEmitter<SubcontractProject>();
  @Output() onSubcontractProjectCreated = new EventEmitter<SubcontractProject>();
  @Output() onSubcontractProjectDeleted = new EventEmitter<number>();

  private readonly translate = inject(TranslateService);

  public allocationForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.allocationForm = this.fb.group({
      projectLabel: [''],
      percentage: [''],
      amount: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log("SubcontractProject: ", this.subcontractProject)

    if (changes['subcontractProject'] && this.subcontractProject && this.modalType === 'edit') {
      this.allocationForm.patchValue({
        projectLabel: this.subcontractProject.project?.projectLabel ?? '',
        percentage: this.subcontractProject.share ?? '',
        amount: this.subcontractProject.amount ?? ''
      });
    }

    if (this.modalType === 'create') {
      this.allocationForm.reset();
    } 
  }

  onSubmit(): void {
    if (this.allocationForm.invalid) {
      this.allocationForm.markAllAsTouched();
      return;
    }

    const formData = this.allocationForm.value;

    if (this.modalType === 'edit' && this.subcontractProject) {
      
    } else if (this.modalType === 'create') {

    }
    
    this.onSave.emit(formData);
  }

  closeModal(): void {
    this.isProjectAllocationVisibleModal.emit(false);
  }

}
