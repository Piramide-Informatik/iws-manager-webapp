import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectStatus } from '../../../../../../Entities/projectStatus';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ProjectStatusStateService } from '../../utils/project-status-state.service';
import { ProjectStatusUtils } from '../../utils/project-status-utils';
import { TranslateService } from '@ngx-translate/core';
import {  MessageService } from 'primeng/api';

@Component({
  selector: 'master-data-edit-project-status',
  standalone: false,
  templateUrl: './edit-project-status.component.html',
  styleUrl: './edit-project-status.component.scss'
})
export class EditProjectStatusComponent {
  public showOCCErrorModalProjectStatus = false;
  currentProjectStatus: ProjectStatus | null = null;
  editProjectStatusForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  private readonly editProjectStatusSource = new BehaviorSubject<ProjectStatus | null>(null);


  constructor(
    private readonly projectStatusUtils: ProjectStatusUtils,
    private readonly projectStatusStateService: ProjectStatusStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupProjectStatusSubscription();
    const savedProjectStatusId = localStorage.getItem('selectedProjectStatusId');
    if (savedProjectStatusId){
      this.loadProjectStatuAfterRefresh(savedProjectStatusId);
      localStorage.removeItem('selectedProjectStatusId');
    }
  }

  private initForm(): void {
    this.editProjectStatusForm = new FormGroup({
      projectStatus: new FormControl('', [Validators.required])
    })
  }
  
  private setupProjectStatusSubscription():void {
    this.subscriptions.add(
      this.projectStatusStateService.currentProjectStatus$.subscribe(projectStatus => {
        this.currentProjectStatus = projectStatus;
        projectStatus ? this.loadProjectStatusData(projectStatus) : this.clearForm();
      })
    );
  }

  private loadProjectStatusData(projectStatus: ProjectStatus):void{
    this.editProjectStatusForm.patchValue({ projectStatus: projectStatus.name });
  }

  private loadProjectStatuAfterRefresh(projectStatusId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.projectStatusUtils.getProjectStatusById(Number(projectStatusId)).subscribe({
        next: (projectStatus) => {
          if (projectStatus) {
            this.projectStatusStateService.setProjectStatusToEdit(projectStatus);
          }
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      })
    );
  }

  clearForm(): void {
    this.editProjectStatusForm.reset();
    this.currentProjectStatus = null;
    this.isSaving = false;
  }

  onSubmit(): void {
    if(this.editProjectStatusForm.invalid || !this.currentProjectStatus || this.isSaving){
      this.markAllAsTouched();
      return;
    };

    this.isSaving = true;
    const updateProjectStatus: ProjectStatus = {
      ...this.currentProjectStatus,
      name: this.editProjectStatusForm.value.projectStatus
    };

    this.subscriptions.add(
      this.projectStatusUtils.updateProjectStatus(updateProjectStatus).subscribe({
        next: (savedProjectStatus) => this.handleSaveSuccess(savedProjectStatus),
        error: (err) => this.handleError(err)
      })
    );
  }

  

  private markAllAsTouched(): void {
    Object.values(this.editProjectStatusForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    })
  }

  private handleSaveSuccess(savedProjectStatus: ProjectStatus): void{
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('TITLE.MESSAGE.SUCCESS'),
      detail: this.translate.instant('TITLE.MESSAGE.UPDATE_SUCCESS')
    });
    this.projectStatusStateService.setProjectStatusToEdit(null);
    this.clearForm();
  }

  private handleError(err: any): void {
    if (err.message === 'Version conflict: Title has been updated by another user') {
      this.showOCCErrorModalProjectStatus = true;
    } else {
      this.handleSaveError(err);
    }
    this.isSaving = false;
  }

  private handleSaveError(error: any): void {
    console.error('Error saving title:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('TITLE.MESSAGE.ERROR'),
      detail: this.translate.instant('TITLE.MESSAGE.UPDATE_FAILED')
    });
    this.isSaving = false;
  }

  onRefresh(): void {
    if (this.currentProjectStatus?.id) {
      localStorage.setItem('selectedProjectStatusId', this.currentProjectStatus.id.toString());
      window.location.reload();
    }
  }
}
