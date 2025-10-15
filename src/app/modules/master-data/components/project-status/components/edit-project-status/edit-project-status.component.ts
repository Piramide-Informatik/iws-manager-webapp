import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ProjectStatus } from '../../../../../../Entities/projectStatus';
import { Subscription } from 'rxjs';
import { ProjectStatusStateService } from '../../utils/project-status-state.service';
import { ProjectStatusUtils } from '../../utils/project-status-utils';
import { TranslateService } from '@ngx-translate/core';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'master-data-edit-project-status',
  standalone: false,
  templateUrl: './edit-project-status.component.html',
  styleUrl: './edit-project-status.component.scss'
})
export class EditProjectStatusComponent implements OnInit {
  public showOCCErrorModalProjectStatus = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
    public isLoading: boolean = false;
  currentProjectStatus: ProjectStatus | null = null;
  editProjectStatusForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly projectStatusUtils: ProjectStatusUtils,
    private readonly projectStatusStateService: ProjectStatusStateService,
    private readonly commonMessageService: CommonMessagesService,
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
      projectStatus: new FormControl('')
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
    this.focusInputIfNeeded();
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
      name: this.editProjectStatusForm.value.projectStatus?.trim()
    };

    this.subscriptions.add(
      this.projectStatusUtils.updateProjectStatus(updateProjectStatus).subscribe({
        next:() =>{
          this.isLoading = false;
          this.clearForm();
          this.commonMessageService.showEditSucessfullMessage();
        },
        error: (error: Error) => {
                  if (error instanceof OccError) {
                  console.log('OCC Error occurred:', error);
                  this.showOCCErrorModalProjectStatus = true;
                  this.occErrorType = error.errorType;
                }else {
                  this.commonMessageService.showErrorEditMessage();
                }
          }
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
    this.commonMessageService.showEditSucessfullMessage();
    this.projectStatusStateService.setProjectStatusToEdit(null);
    this.clearForm();
  }

  private handleError(err: any): void {
    if (err.message === 'Version conflict: ProjectStatus has been updated by another user') {
      this.showOCCErrorModalProjectStatus = true;
    } else {
      this.handleSaveError(err);
    }
    this.isSaving = false;
  }

  private handleSaveError(error: any): void {
    console.error('Error saving title:', error);
    this.commonMessageService.showErrorEditMessage();
    this.isSaving = false;
  }

  onRefresh(): void {
    if (this.currentProjectStatus?.id) {
      localStorage.setItem('selectedProjectStatusId', this.currentProjectStatus.id.toString());
      window.location.reload();
    }
  }

  private focusInputIfNeeded(): void {
    if (this.currentProjectStatus && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
