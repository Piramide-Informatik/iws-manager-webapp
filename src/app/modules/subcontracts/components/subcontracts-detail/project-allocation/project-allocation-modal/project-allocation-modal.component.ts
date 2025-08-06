import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { SubcontractProject } from '../../../../../../Entities/subcontract-project';
import { SubcontractProjectUtils } from '../../../../utils/subcontract-project.utils';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-project-allocation-modal',
  standalone: false,
  templateUrl: './project-allocation-modal.component.html',
  styleUrl: './project-allocation-modal.component.scss'
})
export class ProjectAllocationModalComponent implements OnChanges, OnDestroy {

  @Input() visible = false;
  @Input() modalType: 'create' | 'edit' | 'delete' = 'create';
  @Input() subcontractProject: any | null = null;
  @Input() isVisibleModal: boolean = false;

  @Output() onSave = new EventEmitter<any>();
  @Output() onClose = new EventEmitter<void>();
  @Output() isProjectAllocationVisibleModal = new EventEmitter<boolean>();
  @Output() onMessageOperation = new EventEmitter<{ severity: string, summary: string, detail: string }>()
  @Output() SubcontractProjectUpdated = new EventEmitter<SubcontractProject>();
  @Output() onSubcontractProjectCreated = new EventEmitter<SubcontractProject>();
  @Output() onSubcontractProjectDeleted = new EventEmitter<SubcontractProject>();

  private readonly subcontractProjectUtils = inject(SubcontractProjectUtils);
  private readonly translate = inject(TranslateService);
  private readonly subscription = new Subscription();

  isSubcontractProjectPerformigAction: boolean = false
  public allocationForm!: FormGroup;

  constructor(private readonly fb: FormBuilder, private readonly commonMessageService: CommonMessagesService) {
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeForm(): void {
    this.allocationForm = this.fb.group({
      projectLabel: [''],
      percentage: [''],
      amount: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subcontractProject'] && this.subcontractProject && this.modalType === 'edit') {
      this.isSubcontractProjectPerformigAction = true;

      const sub = this.subcontractProjectUtils.getSubcontractProjectById(this.subcontractProject.id).subscribe({
        next: (fullProject: SubcontractProject | undefined) => {
          if (!fullProject) {
            this.isSubcontractProjectPerformigAction = false;
            return;
          }

          this.subcontractProject = fullProject;

          this.allocationForm.patchValue({
            projectLabel: fullProject.project?.projectLabel ?? '',
            percentage: fullProject.share ?? '',
            amount: fullProject.amount ?? ''
          });

          this.isSubcontractProjectPerformigAction = false;
        },
        error: () => {
          this.isSubcontractProjectPerformigAction = false;
        }
      });

      this.subscription.add(sub);
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
      this.updateSubcontractProject();
    } else if (this.modalType === 'create') {
      this.createSubcontractProject();
    }
    this.onSave.emit(formData);
  }

  private createSubcontractProject(): void { }

  private updateSubcontractProject(): void {
    if (!this.subcontractProject) return;

    const raw = this.allocationForm.value;

    const updatedProject: SubcontractProject = {
      ...this.subcontractProject,
      share: Number(raw.percentage),
      amount: Number(raw.amount)
    };

    this.isSubcontractProjectPerformigAction = true;

    this.subscription.add(
      this.subcontractProjectUtils.updateSubcontractProject(updatedProject).subscribe({
        next: (updated: SubcontractProject) => {
          this.isSubcontractProjectPerformigAction = false;
          this.SubcontractProjectUpdated.emit(updated);
          this.commonMessageService.showEditSucessfullMessage();
          this.isProjectAllocationVisibleModal.emit(false);
        },
        error: () => {
          this.isSubcontractProjectPerformigAction = false;
          this.commonMessageService.showErrorEditMessage();
        }
      })
    );
  }

  closeModal(): void {
    this.isProjectAllocationVisibleModal.emit(false);
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  removeSubcontractProject() {
    if (this.subcontractProject) {
      this.isSubcontractProjectPerformigAction = true;
      this.subcontractProjectUtils.deleteSubcontractProject(this.subcontractProject.id).subscribe({
        next: () => {
          this.onSubcontractProjectDeleted.emit(this.subcontractProject);
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
