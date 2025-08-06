import { Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SubcontractProject } from '../../../../../../Entities/subcontract-project';
import { SubcontractProjectUtils } from '../../../../utils/subcontract-project.utils';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-project-allocation-modal',
  standalone: false,
  templateUrl: './project-allocation-modal.component.html',
  styleUrl: './project-allocation-modal.component.scss'
})
export class ProjectAllocationModalComponent {

  @Input() subcontractProject!: SubcontractProject;

  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();
  @Output() isProjectAllocationVisibleModal = new EventEmitter<boolean>();
  @Output() subcontractProjectDeleted = new EventEmitter<SubcontractProject>();


  private readonly subcontractProjectUtils = inject(SubcontractProjectUtils);
  private readonly translate = inject(TranslateService);
  isSubcontractProjectPerformigAction: boolean = false
  public allocationForm!: FormGroup;

  constructor(private fb: FormBuilder, private readonly commonMessageService: CommonMessagesService) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.allocationForm = this.fb.group({
      projectName: [''],
      percentage: [''],
      amount: ['']
    });
  }

  saveAllocation(): void {
    if (this.allocationForm.invalid) {
      this.allocationForm.markAllAsTouched();
      return;
    }

    const formData = this.allocationForm.value;
    this.onSave.emit(formData);
  }

  closeModal(): void {
  }

  removeSubcontractYear() {
    if (this.subcontractProject) {
      this.isSubcontractProjectPerformigAction = true;
      this.subcontractProjectUtils.deleteSubcontractProject(this.subcontractProject.id).subscribe({
        next: () => {
          this.subcontractProjectDeleted.emit(this.subcontractProject);
          this.isProjectAllocationVisibleModal.emit(false);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.isSubcontractProjectPerformigAction = false;
        },
        error: () => {
          this.closeModal();
          this.commonMessageService.showErrorDeleteMessage();
          this.isSubcontractProjectPerformigAction = false;
          this.isProjectAllocationVisibleModal.emit(false);
        }
      });
    }
  }

}
