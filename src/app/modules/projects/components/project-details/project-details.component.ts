import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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

import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { FundingProgramUtils } from '../../../master-data/components/funding-programs/utils/funding-program-utils';
import { PromoterUtils } from '../../../master-data/components/project-funnels/utils/promoter-utils';
import { buildProject } from '../../../shared/utils/builders/project';
import { ProjectUtils } from '../../../customer/sub-modules/projects/utils/project.utils';
import { OrderUtils } from '../../../customer/sub-modules/orders/utils/order-utils';
import { Order } from '../../../../Entities/order';
import { momentCreateDate } from '../../../shared/utils/moment-date-utils';

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
  private readonly orderUtils = inject(OrderUtils);

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

  public orders = toSignal(
    this.orderUtils.getAllOrders(),
    { initialValue: [] as Order[] }
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
    this.setupOrderListeners();

    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['idProject'];

      // Modo creación
      if (!this.projectId) {
        this.clearForm();
        this.updateTitle(this.translate.instant('PAGETITLE.PROJECT.NEW_PROJECT'));
        return;
      }

      // Modo edición
      this.updateTitle(' ...');
      this.loadProject(Number(this.projectId));
    });
  }

  private setupOrderListeners(): void {
    this.subscriptions.add(
      this.formProject.get('orderIdFue')?.valueChanges.subscribe(orderId => {
        this.updateOrderNumber('orderIdFueNumber', orderId);
      })
    );

    this.subscriptions.add(
      this.formProject.get('promoter')?.valueChanges.subscribe(promoterId => {
        this.updatePromoterNumber('promoterNumber', promoterId);
      })
    );

    this.subscriptions.add(
      this.formProject.get('orderIdAdmin')?.valueChanges.subscribe(orderId => {
        this.updateOrderNumber('orderIdAdminNumber', orderId);
      })
    );
  }

  private updateOrderNumber(controlName: 'orderIdFueNumber' | 'orderIdAdminNumber', orderId: number): void {

    if (orderId) {
      const order = this.orders().find(order => order.id === orderId);
      const orderNumber = order?.orderNo?.toString() || '';

      this.formProject.get(controlName)?.setValue(orderNumber, { emitEvent: false });
    } else {
      this.formProject.get(controlName)?.setValue('', { emitEvent: false });
    }
  }

  private updatePromoterNumber(controlName: 'promoterNumber', promoterId: number): void {

    if (promoterId) {
      const promoter = this.promoters().find(promoter => promoter.id === promoterId);
      const promoterNumber = promoter?.promoterNo?.toString() || '';

      this.formProject.get(controlName)?.setValue(promoterNumber, { emitEvent: false });
    } else {
      this.formProject.get(controlName)?.setValue('', { emitEvent: false });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeForm(): void {
    this.formProject = this.fb.group({
      projectLabel: ['', [Validators.required]],
      projectName: [''],
      customer: [null],
      orderIdFue: [null],
      orderIdFueNumber: [''],
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
      orderIdAdmin: [null],
      orderIdAdminNumber: ['']
    });

    this.formProject.get('orderIdAdminNumber')?.disable();
    this.formProject.get('promoterNumber')?.disable();
    this.formProject.get('orderIdFueNumber')?.disable();
  }

  private setupProjectSubscription(): void {
    // Add ProjectStateService if needed
  }

  private loadProject(projectId: number): void {
    this.projectUtils.getProjectById(projectId).subscribe({
      next: (project) => {
        console.log('Project loaded:', project);
        if (project) {
          this.currentProject = project;
          this.loadProjectFormData(project);
          this.updateTitle(project.projectLabel || 'Unnamed Project');
        }
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.clearForm();
      }
    });
  }

  private loadProjectFormData(project: Project): void {
    this.currentProject = project;

    this.formProject.patchValue({
      projectLabel: project.projectLabel,
      projectName: project.projectName,
      customer: project.customer?.id,
      orderIdFue: project.orderFue?.id,
      orderIdFueNumber: project.orderFue?.orderNo,
      fundingProgram: project.fundingProgram?.id,
      promoterNumber: project.promoter?.promoterNo,
      promoter: project.promoter?.id,
      fundingLabel: project.fundingLabel,
      authorizationDate: momentCreateDate(project.authorizationDate),
      startDate: momentCreateDate(project.startDate),
      endDate: momentCreateDate(project.endDate),
      fundingRate: project.fundingRate,
      stuffFlat: project.stuffFlat,
      shareResearch: project.shareResearch,
      hourlyRateMueu: project.hourlyRateMueu,
      productiveHoursPerYear: project.productiveHoursPerYear,
      orderIdAdmin: project.orderAdmin?.id,
      orderIdAdminNumber: project.orderAdmin?.orderNo
    });

    this.formProject.markAsPristine();
  }

  private updateTitle(name: string): void {
    this.titleService.setTitle(
      `${this.translate.instant('PAGETITLE.PROJECT.PROJECTS')} ${name} ${this.translate.instant('PAGETITLE.PROJECT.DETAILS')}`
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
      next: (savedProject) => {
        console.log('Project updated successfully:', savedProject);
        this.handleSaveSuccess(savedProject)
      },
      error: (error) => {
        console.error('Error updating project:', error);
        this.handleSaveError(error)
      }
    });
  }

  private buildUpdatedProject(): Project {
    const formValue = this.formProject.value;

    const projectData = {
      ...this.currentProject,
      ...this.buildCommonProjectData(formValue)
    };

    return buildProject(projectData);
  }

  private buildCommonProjectData(formValue: any): any {
    return {
      projectLabel: formValue.projectLabel,
      projectName: formValue.projectName,
      customer: this.buildEntityWithIdVersion(formValue.customer),
      orderFue: this.buildEntityWithIdVersion(formValue.orderIdFue),
      orderAdmin: this.buildEntityWithIdVersion(formValue.orderIdAdmin),
      fundingProgram: this.buildEntityWithIdVersion(formValue.fundingProgram),
      promoter: this.buildEntityWithIdVersion(formValue.promoter),
      fundingLabel: formValue.fundingLabel,
      authorizationDate: formValue.authorizationDate,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      fundingRate: formValue.fundingRate,
      stuffFlat: formValue.stuffFlat,
      shareResearch: formValue.shareResearch,
      hourlyRateMueu: formValue.hourlyRateMueu,
      productiveHoursPerYear: formValue.productiveHoursPerYear
    };
  }

  private buildEntityWithIdVersion(entityId?: number): any {
    if (!entityId) return null;

    return {
      id: entityId,
      version: 0
    };
  }

  private handleSaveSuccess(savedProject: Project): void {
    this.formProject.markAsPristine();
    this.currentProject = savedProject;
    this.loadProject(this.projectId);
    this.commonMessageService.showEditSucessfullMessage();
    this.isSaving = false;
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
