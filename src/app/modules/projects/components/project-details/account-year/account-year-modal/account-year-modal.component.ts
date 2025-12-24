import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ProjectPeriodUtils } from '../../../../utils/project-period.util';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { ProjectPeriod } from '../../../../../../Entities/project-period';
import { FormControl, FormGroup } from '@angular/forms';
import { InputNumber } from 'primeng/inputnumber';
import { momentCreateDate, momentFormatDate } from '../../../../../shared/utils/moment-date-utils';
import { Project } from '../../../../../../Entities/project';

@Component({
  selector: 'app-project-period-modal',
  standalone: false,
  providers: [MessageService, ConfirmationService, TranslatePipe, TranslateDirective],
  templateUrl: './account-year-modal.component.html',
  styleUrl: './account-year-modal.component.scss'
})
export class ProjectsAccountYearModalComponent implements OnInit, OnChanges, OnDestroy {

  private readonly subscription = new Subscription();
  private readonly projectPeriodUtils = inject(ProjectPeriodUtils);
  private readonly commonMessageService = inject(CommonMessagesService);

  @Input() modalType: 'create' | 'delete' | 'edit' = "create";
  @Input() currentProjectPeriodEntity!: ProjectPeriod | undefined;
  @Input() currentProject!: Project | null;
  @Input() visibleModal: boolean = false;

  @Output() isVisibleProjectPeriodModal = new EventEmitter<boolean>();
  @Output() projectPeriodCreatedUpdated = new EventEmitter<{ status: 'success' | 'error' }>();
  @Output() deletedProjectPeriod = new EventEmitter<ProjectPeriod>();
  @ViewChild('firstInput') firstInput!: InputNumber;

  public formAccountYear!: FormGroup;
  public isLoading = false;
  public showOCCErrorModalProjectPeriod = false;
  public isLoadingDelete: boolean = false;
  public visiblProjectPeriodModal: boolean = false;
  public visibleDeleteEntityModal = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  errorMsg: string | null = null;

  ngOnInit(): void {
    this.initForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visibleModal'] && this.visibleModal){
      setTimeout(() => {
        this.firstInputFocus();
      })
    }

    if((changes['currentProjectPeriodEntity'] || changes['visibleModal']) && this.modalType === 'edit' && this.currentProjectPeriodEntity && this.formAccountYear){
      this.formAccountYear.patchValue({
        periodNo: this.currentProjectPeriodEntity?.periodNo,
        startDate: momentCreateDate(this.currentProjectPeriodEntity?.startDate),
        endDate: momentCreateDate(this.currentProjectPeriodEntity?.endDate)
      });
    }

    if (changes['visibleModal'] && !this.visibleModal && this.formAccountYear) {
      this.formAccountYear.reset();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initForm(): void {
    this.formAccountYear = new FormGroup({
      periodNo: new FormControl(null),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
    });
  }

  onSubmit(): void {
    if(!this.currentProject) return;

    if(this.modalType === 'create'){
      this.isLoading = true;
      const newProjectPeriod: Omit<ProjectPeriod, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
        periodNo: this.formAccountYear.get('periodNo')?.value,
        startDate: momentFormatDate(this.formAccountYear.get('startDate')?.value) ?? '',
        endDate: momentFormatDate(this.formAccountYear.get('endDate')?.value) ?? '',
        project: this.currentProject
      }
      this.createProjectPeriod(newProjectPeriod);

    }else if(this.modalType === 'edit'){
      this.updateProjectPeriod();
    }
  }

  private createProjectPeriod(newProjectPeriod: Omit<ProjectPeriod, 'id' | 'createdAt' | 'updatedAt' | 'version'>): void {
    this.projectPeriodUtils.createProjectPeriod(newProjectPeriod).subscribe({
      next: () => {
        this.isLoading = false;
        this.projectPeriodCreatedUpdated.emit({status: 'success'});
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.closeModal();
      },
      error: (error) => {
        this.isLoading = false;
        this.projectPeriodCreatedUpdated.emit({ status: 'error' });
        this.commonMessageService.showErrorCreatedMessage();
      }
    });
  }

  private updateProjectPeriod(): void {
    if(!this.currentProjectPeriodEntity) return;

    this.isLoading = true;
    const projectPeriodEdited: ProjectPeriod = {
      ...this.currentProjectPeriodEntity,
      periodNo: this.formAccountYear.get('periodNo')?.value,
      startDate: momentFormatDate(this.formAccountYear.get('startDate')?.value) ?? '',
      endDate: momentFormatDate(this.formAccountYear.get('endDate')?.value) ?? ''
    }
    this.projectPeriodUtils.updateProjectPeriod(projectPeriodEdited).subscribe({
      next: () => {
        this.isLoading = false;
        this.commonMessageService.showEditSucessfullMessage();
        this.projectPeriodCreatedUpdated.emit({status: 'success'});
        this.closeModal();
      },
      error: (error) => {
        this.isLoading = false;
        if(error instanceof OccError){
          this.visiblProjectPeriodModal = false;
          this.showOCCErrorModalProjectPeriod = true;
        }
      }
    });;
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  closeModal(): void {
    this.isVisibleProjectPeriodModal.emit(false);
    this.formAccountYear.reset();
  }

  deleteEmployeeContractEntity() {
    if (this.currentProjectPeriodEntity) {
      this.isLoadingDelete = true;
      this.projectPeriodUtils.deleteProjectPeriod(this.currentProjectPeriodEntity.id).subscribe({
        next: () => {
          this.isLoadingDelete = false;
          this.visiblProjectPeriodModal = false;
          this.isVisibleProjectPeriodModal.emit(false);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.deletedProjectPeriod.emit(this.currentProjectPeriodEntity);
        },
        error: (error) => {
          this.isLoadingDelete = false;
          this.commonMessageService.showErrorDeleteMessage();
          if (error instanceof OccError || error?.message?.includes('404') || error?.errorType === 'DELETE_UNEXISTED') {
            this.visiblProjectPeriodModal = false;
            this.showOCCErrorModalProjectPeriod = true;
            this.occErrorType = 'DELETE_UNEXISTED';
          }
        }
      });
    }
  }

  private firstInputFocus(): void {
    if(this.firstInput && this.isCreateMode){
      setTimeout(()=>{
        if(this.firstInput.input.nativeElement){
          this.firstInput.input.nativeElement.focus()
        }
      },300)
    }
  }
}
