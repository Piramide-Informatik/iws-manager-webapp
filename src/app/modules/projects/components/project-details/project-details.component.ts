import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, finalize } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';

import { Project } from '../../../../Entities/project';
import { Customer } from '../../../../Entities/customer';
import { FundingProgram } from '../../../../Entities/fundingProgram';
import { Promoter } from '../../../../Entities/promoter';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { ProjectUtils } from '../../utils/project.utils';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { FundingProgramUtils } from '../../../master-data/components/funding-programs/utils/funding-program-utils';
import { PromoterUtils } from '../../../master-data/components/project-funnels/utils/promoter-utils';
import { buildProject } from '../../../shared/utils/builders/project';

@Component({
  selector: 'app-project-details',
  standalone: false,
  templateUrl: './project-details.component.html',
  styleUrl: './project-details.component.scss',
  providers: [MessageService]
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  public showDeleteProjectModal = false;
  public isLoadingProject = false;
  public isSaving = false;
  public projectId!: number;

  private readonly subscriptions = new Subscription();
  private readonly projectUtils = inject(ProjectUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly fundingProgramUtils = inject(FundingProgramUtils);
  private readonly promoterUtils = inject(PromoterUtils);

  public formProject!: FormGroup;
  public currentProject: Project | null = null;

  // Signals para las opciones de los selects
  public customers = toSignal(
    this.customerUtils.getCustomersSortedByName(),
    { initialValue: [] as Customer[] }
  );

  public fundingPrograms = toSignal(
    this.fundingProgramUtils.getAllFundingPrograms(),
    { initialValue: [] as FundingProgram[] }
  );

  public promoters = toSignal(
    this.promoterUtils.getAllPromoters(),
    { initialValue: [] as Promoter[] }
  );

  constructor(
    private readonly fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly titleService: Title,
    private readonly commonMessageService: CommonMessagesService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.setupProjectSubscription();
    
    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['id'];

      // Modo creación
      if (!this.projectId) {
        this.clearForm();
        this.updateTitle(this.translate.instant('PAGETITLE.NEW_PROJECT'));
        return;
      }

      // Modo edición
      this.updateTitle(' ...');
      this.loadProject(Number(this.projectId));
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeForm(): void {
    this.formProject = this.fb.group({
      projectName: ['', [Validators.required]],
      title: [''],
      customer: [null],
      orderIdFue: [null],
      fundingProgram: [null],
      promoterNumber: [''],
      promoter: [null],
      fundingLabel: [''],
      authorizationDate: [''],
      startDate: [''],
      endDate: [''],
      fundingRate: [null, [Validators.min(0), Validators.max(100)]],
      stuffFlat: [null, [Validators.min(0)]],
      shareResearch: [null, [Validators.min(0), Validators.max(100)]],
      hourlyRateMueu: [null, [Validators.min(0)]],
      productiveHoursPerYear: [null, [Validators.min(0)]],
      orderIdAdmin: [null]
    });
  }

  private setupProjectSubscription(): void {
    // Aquí puedes agregar un ProjectStateService si lo necesitas
  }

  private loadProject(projectId: number): void {
    this.projectUtils.getProjectById(projectId).subscribe({
      next: (project) => {
        if (project) {
          this.currentProject = project;
          this.loadProjectFormData(project);
          this.updateTitle(project.projectName || 'Unnamed Project');
        }
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.clearForm();
      }
    });
  }

  private loadProjectFormData(project: Project): void {
    this.formProject.patchValue({
      projectName: project.projectName,
      title: project.title,
      customer: project.customer?.id,
      orderIdFue: project.orderIdFue,
      fundingProgram: project.fundingProgram?.id,
      promoterNumber: project.promoter?.id, // Ajustar según necesidad
      promoter: project.promoter?.id,
      fundingLabel: project.fundingLabel,
      authorizationDate: project.authorizationDate ? new Date(project.authorizationDate) : null,
      startDate: project.startDate ? new Date(project.startDate) : null,
      endDate: project.endDate ? new Date(project.endDate) : null,
      fundingRate: project.fundingRate,
      stuffFlat: project.stuffFlat,
      shareResearch: project.shareResearch,
      hourlyRateMueu: project.hourlyRateMueu,
      productiveHoursPerYear: project.productiveHoursPerYear,
      orderIdAdmin: project.orderIdAdmin
    });
  }

  private updateTitle(name: string): void {
    this.titleService.setTitle(
      `${this.translate.instant('PAGETITLE.PROJECT')} ${name} ${this.translate.instant('PAGETITLE.PROJECTS.DETAILS')}`
    );
  }

  clearForm(): void {
    this.formProject.reset();
    this.currentProject = null;
    this.isSaving = false;
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;

    if (this.projectId) {
      this.updateProject();
    } else {
      this.createProject();
    }
  }

  private shouldPreventSubmission(): boolean {
    return this.formProject.invalid || this.isSaving;
  }

  private markAllAsTouched(): void {
    Object.values(this.formProject.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private updateProject(): void {
    const updatedProject = this.buildUpdatedProject();
    
    this.projectUtils.updateProject(updatedProject).subscribe({
      next: (savedProject) => this.handleSaveSuccess(savedProject),
      error: (error) => this.handleSaveError(error)
    });
  }

  private createProject(): void {
    const newProject = this.buildNewProject();
    
    this.projectUtils.createProject(newProject)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: (createdProject) => this.handleCreateSuccess(createdProject),
        error: (error) => this.handleSaveError(error)
      });
  }

  private buildUpdatedProject(): Project {
    const formValue = this.formProject.value;
    
    const projectData = {
      ...this.currentProject,
      projectName: formValue.projectName,
      title: formValue.title,
      customer: this.buildCustomerEntity(formValue.customer),
      orderIdFue: formValue.orderIdFue,
      fundingProgram: this.buildFundingProgramEntity(formValue.fundingProgram),
      promoter: this.buildPromoterEntity(formValue.promoter),
      fundingLabel: formValue.fundingLabel,
      authorizationDate: formValue.authorizationDate?.toISOString(),
      startDate: formValue.startDate?.toISOString(),
      endDate: formValue.endDate?.toISOString(),
      fundingRate: formValue.fundingRate,
      stuffFlat: formValue.stuffFlat,
      shareResearch: formValue.shareResearch,
      hourlyRateMueu: formValue.hourlyRateMueu,
      productiveHoursPerYear: formValue.productiveHoursPerYear,
      orderIdAdmin: formValue.orderIdAdmin
    };

    return buildProject(projectData);
  }

  private buildNewProject(): Project {
    const formValue = this.formProject.value;
    
    const projectData = {
      projectName: formValue.projectName,
      title: formValue.title,
      customer: this.buildCustomerEntity(formValue.customer),
      orderIdFue: formValue.orderIdFue,
      fundingProgram: this.buildFundingProgramEntity(formValue.fundingProgram),
      promoter: this.buildPromoterEntity(formValue.promoter),
      fundingLabel: formValue.fundingLabel,
      authorizationDate: formValue.authorizationDate?.toISOString(),
      startDate: formValue.startDate?.toISOString(),
      endDate: formValue.endDate?.toISOString(),
      fundingRate: formValue.fundingRate,
      stuffFlat: formValue.stuffFlat,
      shareResearch: formValue.shareResearch,
      hourlyRateMueu: formValue.hourlyRateMueu,
      productiveHoursPerYear: formValue.productiveHoursPerYear,
      orderIdAdmin: formValue.orderIdAdmin
    };

    return buildProject(projectData);
  }

  private buildCustomerEntity(customerId?: number): Project['customer'] {
    if (!customerId) return null;
    
    const customer = this.customers().find(c => c.id === customerId);
    return customer || { id: customerId } as Customer;
  }

  private buildFundingProgramEntity(fundingProgramId?: number): Project['fundingProgram'] {
    if (!fundingProgramId) return null;
    
    const fundingProgram = this.fundingPrograms().find(f => f.id === fundingProgramId);
    return fundingProgram || { id: fundingProgramId } as FundingProgram;
  }

  private buildPromoterEntity(promoterId?: number): Project['promoter'] {
    if (!promoterId) return null;
    
    const promoter = this.promoters().find(p => p.id === promoterId);
    return promoter || { id: promoterId } as Promoter;
  }

  private handleSaveSuccess(savedProject: Project): void {
    this.formProject.markAsPristine();
    this.commonMessageService.showEditSucessfullMessage();
    this.currentProject = savedProject;
    this.isSaving = false;
  }

  private handleCreateSuccess(createdProject: Project): void {
    this.isSaving = false;
    this.commonMessageService.showCreatedSuccesfullMessage();
    this.router.navigate(['../edit', createdProject.id], { relativeTo: this.activatedRoute });
  }

  private handleSaveError(error: any): void {
    this.isSaving = false;
    console.error('Error saving project:', error);
    this.commonMessageService.showErrorEditMessage();
  }

  onProjectDeleteConfirm(): void {
    if (!this.projectId) return;

    this.isLoadingProject = true;
    this.projectUtils.deleteProject(this.projectId).subscribe({
      next: () => {
        this.isLoadingProject = false;
        this.showDeleteProjectModal = false;
        this.commonMessageService.showDeleteSucessfullMessage();
        this.router.navigate(['/projects']);
      },
      error: (error) => {
        this.isLoadingProject = false;
        this.showDeleteProjectModal = false;
        this.handleErrorDelete(error);
      }
    });
  }

  private handleErrorDelete(error: any): void {
    console.error('Error deleting project:', error);
    this.commonMessageService.showErrorDeleteMessage();
  }
}