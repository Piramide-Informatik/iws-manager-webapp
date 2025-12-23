import { Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ProjectPeriodUtils } from '../../../../utils/project-period.util';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { ProjectPeriod } from '../../../../../../Entities/project-period';

@Component({
  selector: 'app-project-period-modal',
  standalone: false,
  providers: [MessageService, ConfirmationService, TranslatePipe, TranslateDirective],
  templateUrl: './account-year-modal.component.html',
  styleUrl: './account-year-modal.component.scss'
})
export class ProjectsAccountYearModalComponent implements OnDestroy {

  private readonly subscription = new Subscription();
  private readonly projectPeriodUtils = inject(ProjectPeriodUtils);
  private readonly commonMessageService = inject(CommonMessagesService);

  @Input() modalType: 'create' | 'delete' | 'edit' = "create";
  @Input() currentProjectPeriodEntity!: any;
  @Input() visibleModal: boolean = false;

  @Output() isVisibleProjectPeriodModal = new EventEmitter<boolean>();
  @Output() deletedProjectPeriod = new EventEmitter<ProjectPeriod>();

  public showOCCErrorModalProjectPeriod = false;
  public isLoadingDelete: boolean = false;
  public visiblProjectPeriodModal: boolean = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  errorMsg: string | null = null;

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  closeModal(): void {
    this.isVisibleProjectPeriodModal.emit(false);
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
}
