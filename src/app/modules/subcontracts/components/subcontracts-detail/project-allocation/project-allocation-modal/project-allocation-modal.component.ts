import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-project-allocation-modal',
  standalone: false,
  templateUrl: './project-allocation-modal.component.html',
  styleUrl: './project-allocation-modal.component.scss'
})
export class ProjectAllocationModalComponent implements OnInit, OnChanges, OnDestroy {

  @Input() modalType: 'create' | 'edit' | 'delete' = 'create';
  @Input() subcontractProject!: SubcontractProject | undefined;
  @Input() currentSubcontract!: Subcontract | undefined;
  @Input() isVisibleModal: boolean = false;

  @Output() isProjectAllocationVisibleModal = new EventEmitter<boolean>();
  @Output() SubcontractProjectUpdated = new EventEmitter<SubcontractProject>();
  @Output() subcontractProjectCreated = new EventEmitter<{ status: 'success' | 'error' }>();
  @Output() subcontractProjectDeleted = new EventEmitter<SubcontractProject>();

  @ViewChild('pSelect') firstInput!: Select;

  private readonly subcontractProjectUtils = inject(SubcontractProjectUtils);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly subcontractUtils = inject(SubcontractUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscription = new Subscription();

  isLoading: boolean = false
  isLoadingDelete: boolean = false
  public allocationForm!: FormGroup;
  public showOCCErrorSubcontractProject = false;
  visibleSubcontractProjectModal = false;
  private readonly customerId: number = this.route.snapshot.params['id'];
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showShareWarning: boolean = false;
  public currentTotalShare: number = 0;
  private existingSubcontractProjects: SubcontractProject[] = [];

  private projects: Project[] = [];
  public projectLabels = toSignal(
    this.projectUtils.getAllProjects().pipe(
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
          if (subcontract) {
            this.currentSubcontract = subcontract;
            this.loadExistingSubcontractProjects(subcontract.id);
          }
        })
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadExistingSubcontractProjects(subcontractId: number): void {
    this.subcontractProjectUtils.getAllSubcontractsProject(subcontractId).subscribe({
      next: (projects) => {
        this.existingSubcontractProjects = projects;
        this.calculateTotalShare();
      },
      error: (error) => {
        console.error('Error loading subcontract projects:', error);
      }
    });
  }

  private calculateTotalShare(): void {
    if (!this.currentSubcontract?.id) return;

    let totalShare = this.existingSubcontractProjects.reduce((sum, project) => {
      if (this.modalType === 'edit' && this.subcontractProject && project.id === this.subcontractProject.id) {
        return sum; 
      }
      return sum + (project.share || 0);
    }, 0);

  
    const currentFormShare = this.allocationForm.get('percentage')?.value || 0;
    totalShare += currentFormShare;

    this.currentTotalShare = Math.round(totalShare * 100) / 100;
    this.showShareWarning = this.currentTotalShare !== 100;
  }

  private initializeForm(): void {
    this.allocationForm = this.fb.group({
      projectLabel: ['', [Validators.required, this.uniqueProjectValidator.bind(this)]],
      percentage: ['', [Validators.max(100)]],
      amount: [{ value: '', disabled: true }]
    });

    this.allocationForm.get('percentage')?.valueChanges.subscribe((share: number) => {
      const invoiceGross = this.currentSubcontract?.invoiceGross ?? 0;
      const calculatedAmount = (share * invoiceGross * 0.01).toFixed(2);

      this.allocationForm.get('amount')?.setValue(calculatedAmount, { emitEvent: false });

      this.calculateTotalShare();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subcontractProject'] && this.subcontractProject && this.modalType === 'edit') {
      this.allocationForm.patchValue({
        projectLabel: this.subcontractProject.project?.id ?? '',
        percentage: this.subcontractProject.share ?? '',
        amount: this.subcontractProject.amount ?? ''
      });
    }

    if (this.modalType === 'create') {
      this.allocationForm.reset();
    }

    if (changes['isVisibleModal'] && this.isVisibleModal) {
      this.firstInputFocus();
      if (this.currentSubcontract?.id) {
        this.loadExistingSubcontractProjects(this.currentSubcontract.id);
      }
    }

    if (changes['subcontractProject'] || changes['currentSubcontract']) {
      setTimeout(() => {
        this.calculateTotalShare();
      }, 100);
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

  private uniqueProjectValidator(control: FormControl): { [key: string]: any } | null {
    const selectedProjectId = control.value;

    if (!selectedProjectId || this.existingSubcontractProjects.length === 0) {
      return null;
    }

    const projectExists = this.existingSubcontractProjects.some(existingProject => {
      if (this.modalType === 'edit' && this.subcontractProject?.id) {
        return existingProject.project?.id === selectedProjectId &&
          existingProject.id !== this.subcontractProject.id;
      }

      return existingProject.project?.id === selectedProjectId;
    });

    return projectExists ? { projectExists: true } : null;
  }

  private createSubcontractProject(): void {
    if (this.allocationForm.invalid) return;

    const newSubcontractProject: Omit<SubcontractProject, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      subcontractYear: null,
      project: this.allocationForm.value.projectLabel ? this.getProjectSelected(this.allocationForm.value.projectLabel) : null,
      subcontract: this.currentSubcontract!,
      amount: (this.allocationForm.value.percentage * this.currentSubcontract!.invoiceGross / 100.00),
      share: this.allocationForm.value.percentage
    }

    this.isLoading = true;
    this.subscription.add(
      this.subcontractProjectUtils.createNewSubcontractProject(newSubcontractProject).subscribe({
        next: (created: SubcontractProject) => {
          this.isLoading = false;
          this.subcontractProjectCreated.emit({ status: 'success' });
          this.commonMessageService.showCreatedSuccesfullMessage();
          this.isProjectAllocationVisibleModal.emit(false);
        },
        error: () => {
          this.isLoading = false;
          this.subcontractProjectCreated.emit({ status: 'error' });
          this.commonMessageService.showErrorCreatedMessage();
        }
      })
    )
  }

  private getProjectSelected(projectId: number): Project | null {
    return this.projects.find(p => p.id === projectId) ?? null;
  }

  private updateSubcontractProject(): void {
    if (!this.subcontractProject) return;

    const raw = this.allocationForm.value;
    const share = Number(raw.percentage);
    const invoiceGross = this.subcontractProject.subcontract?.invoiceGross ?? 0;
    const amount = share * invoiceGross /100.00;

    const updatedProject: SubcontractProject = {
      ...this.subcontractProject,
      project: this.getProjectSelected(raw.projectLabel),
      share,
      amount
    };

    this.isLoading = true;
    this.subscription.add(
      this.subcontractProjectUtils.updateSubcontractProject(updatedProject).subscribe({
        next: (updated: SubcontractProject) => {
          this.isLoading = false;
          console.log("updated:", updated)
          this.SubcontractProjectUpdated.emit(updated);
          this.commonMessageService.showEditSucessfullMessage();
          this.isProjectAllocationVisibleModal.emit(false);
        },
        error: (err) => {
          this.isLoading = false;
          this.commonMessageService.showErrorEditMessage();
          this.handleUpdateErrorOcc(err);
        }
      })
    );
  }

  private handleUpdateErrorOcc(err: any): void {
    if (err instanceof OccError) {
      this.showOCCErrorSubcontractProject = true;
      this.occErrorType = err.errorType;
    }
  }

  openSubcontractProjectModal() {
    this.visibleSubcontractProjectModal = true;
  }

  closeModal(): void {
    this.isProjectAllocationVisibleModal.emit(false);
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  removeSubcontractProject() {
    if (this.subcontractProject) {
      this.isLoadingDelete = true;
      this.subcontractProjectUtils.deleteSubcontractProject(this.subcontractProject.id).subscribe({
        next: () => {
          this.subcontractProjectDeleted.emit(this.subcontractProject);
          this.isProjectAllocationVisibleModal.emit(false);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.isLoadingDelete = false;
          this.visibleSubcontractProjectModal = false;
        },
        error: (error) => {
          console.error('Error deleting subcontract project', error);
          this.handleDeleteErrorOcc(error);
          this.commonMessageService.showErrorDeleteMessage();
          this.isLoadingDelete = false;
          this.visibleSubcontractProjectModal = false;
        }
      });
    }
  }

  private handleDeleteErrorOcc(err: any): void {
    if (err instanceof OccError || err?.message.includes('404')) {
      this.showOCCErrorSubcontractProject = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  private firstInputFocus(): void {
    setTimeout(() => {
      if (this.firstInput) {
        this.firstInput.focus();
      }
    }, 300)
  }
}