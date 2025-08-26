import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SubcontractProject } from '../../../../../../Entities/subcontract-project';
import { SubcontractProjectUtils } from '../../../../utils/subcontract-project.utils';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { map, Subscription } from 'rxjs';
import { ProjectUtils } from '../../../../../projects/utils/project.utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../../../../../../Entities/project';
import { SubcontractUtils } from '../../../../utils/subcontracts-utils';
import { Subcontract } from '../../../../../../Entities/subcontract';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-project-allocation-modal',
  standalone: false,
  templateUrl: './project-allocation-modal.component.html',
  styleUrl: './project-allocation-modal.component.scss'
})
export class ProjectAllocationModalComponent implements OnChanges, OnDestroy {

  @Input() modalType: 'create' | 'edit' | 'delete' = 'create';
  @Input() subcontractProject!: SubcontractProject | undefined;
  @Input() isVisibleModal: boolean = false;

  @Output() isProjectAllocationVisibleModal = new EventEmitter<boolean>();
  @Output() SubcontractProjectUpdated = new EventEmitter<SubcontractProject>();
  @Output() onSubcontractProjectCreated = new EventEmitter<SubcontractProject>();
  @Output() onSubcontractProjectDeleted = new EventEmitter<SubcontractProject>();

  @ViewChild('pSelect') firstInput!: Select;

  private readonly subcontractProjectUtils = inject(SubcontractProjectUtils);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly subcontractUtils = inject(SubcontractUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscription = new Subscription();

  private currentSubcontract!: Subcontract;
  isSubcontractProjectPerformigAction: boolean = false
  public allocationForm!: FormGroup;
   public showOCCErrorSubcontractProject = false;
  private readonly customerId: number = this.route.snapshot.params['id'];
  private projects: Project[] = [];
  public projectLabels = toSignal(
    this.projectUtils.getAllProjectByCustomerId(this.customerId).pipe(
      map(projects => {
        this.projects = projects;
        return projects.map(({ id, projectLabel }) => ({ id, projectLabel }))
      })
    ),
    { initialValue: [] }
  );

  constructor(private readonly fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.route.params.subscribe(params => {
        const subcontractId = params['subContractId'];
        this.subcontractUtils.getSubcontractById(subcontractId).subscribe(subcontract => {
          if(subcontract){
            this.currentSubcontract = subcontract;
          }
        })
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeForm(): void {
    this.allocationForm = this.fb.group({
      projectLabel: [''],
      percentage: [''],
      amount: [{ value: '', disabled: true }]
    });

    this.allocationForm.get('percentage')?.valueChanges.subscribe((share: number) => {
      const invoiceGross = this.currentSubcontract?.invoiceGross ?? 0;
      const calculatedAmount = (share * invoiceGross).toFixed(2);

      this.allocationForm.get('amount')?.setValue(calculatedAmount, { emitEvent: false });
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
            projectLabel: fullProject.project?.id ?? '',
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

    if(changes['isVisibleModal'] && this.isVisibleModal){
      this.firstInputFocus();
    }
  }

  onSubmit(): void {
    if (this.allocationForm.invalid) {
      this.allocationForm.markAllAsTouched();
      return;
    }

    if (this.modalType === 'edit' && this.subcontractProject) {
      this.updateSubcontractProject();
    } else if (this.modalType === 'create') {
      this.createSubcontractProject();
    }
  }

  private createSubcontractProject(): void {
    if (this.allocationForm.invalid) return;

    const newSubcontractProject: Omit<SubcontractProject, 'id' | 'createdAt' | 'updatedAt' | 'version' > = {
      subcontractYear: null,
      project: this.allocationForm.value.projectLabel ? this.getProjectSelected(this.allocationForm.value.projectLabel) : null,
      subcontract: this.currentSubcontract,
      amount: (this.allocationForm.value.percentage * this.currentSubcontract.invoiceGross),
      share: this.allocationForm.value.percentage
    }

    this.isSubcontractProjectPerformigAction = true;
    this.subscription.add(
      this.subcontractProjectUtils.createNewSubcontractProject(newSubcontractProject).subscribe({
        next: (created: SubcontractProject) => {
          this.isSubcontractProjectPerformigAction = false;
          this.onSubcontractProjectCreated.emit(created);
          this.commonMessageService.showCreatedSuccesfullMessage();
          this.isProjectAllocationVisibleModal.emit(false);
        },
        error: () => {
          this.isSubcontractProjectPerformigAction = false;
          this.commonMessageService.showErrorCreatedMessage();
        }
      })
    )
  }

  private getProjectSelected(projectId: number): Project | null {
    return this.projects.find( p => p.id === projectId) ?? null;
  }

  private updateSubcontractProject(): void {
    if (!this.subcontractProject) return;

    const raw = this.allocationForm.value;
    const share = Number(raw.percentage);
    const invoiceGross = this.subcontractProject.subcontract?.invoiceGross ?? 0;
    const amount = share * invoiceGross;

    const updatedProject: SubcontractProject = {
      ...this.subcontractProject,
      share,
      amount
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
        error: (err) => {
          this.isSubcontractProjectPerformigAction = false;
          if (err.message === 'Conflict detected: subcontract project version mismatch') {
            this.showOCCErrorSubcontractProject = true;
          } else {
            this.commonMessageService.showErrorEditMessage();
          }
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
          this.commonMessageService.showErrorDeleteMessage();
          this.isSubcontractProjectPerformigAction = false;
          this.isProjectAllocationVisibleModal.emit(false);
        }
      });
    }
  }

  private firstInputFocus(): void {
    setTimeout(()=>{
      if(this.firstInput){
        this.firstInput.focus();
        this.firstInput.show();
      }
    },300)
  }
}
