import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectPackagesUtils } from '../../../../utils/project-packages.util';
import { ProjectPackage } from '../../../../../../Entities/ProjectPackage';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { momentCreateDate } from '../../../../../shared/utils/moment-date-utils';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-modal-project-package',
  standalone: false,
  templateUrl: './work-package-modal.component.html',
  styleUrl: './work-package-modal.component.scss'
})
export class ModalWorkPackageComponent implements OnInit, OnChanges {
  private readonly projectPackagesUtils = inject(ProjectPackagesUtils);
  private readonly subscriptions = new Subscription();
  private readonly commonMessagesService = inject(CommonMessagesService);

  @Input() modalProjectPackageType: 'create' | 'delete' | 'edit' = 'create';
  @Input() visibleProjectPackage: boolean = false;
  @Input() packageNo: number | null = null;
  @Input() packageToDelete: number | null = null;
  @Input() selectedProjectPackage!: any;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createProjectPackage = new EventEmitter<{ created?: ProjectPackage, status: 'success' | 'error' }>();
  @Output() editedProjectPackage = new EventEmitter<{ edited?: ProjectPackage, status: 'success' | 'error' }>();
  @Output() deleteProjectPackageEvent = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;
  dateFormatPicker: string = 'dd.mm.yy';
  public readonly workPackageForm = new FormGroup({
    packageno: new FormControl('', [Validators.required]),
    packageSerial: new FormControl(''),
    dates: new FormControl([]),
    packageTitle: new FormControl(''),
  });
  projectId = '';
  public showOCCErrorModalProjectPackage = false;
  public occErrorProjectPackageType: OccErrorType = 'UPDATE_UNEXISTED';
  constructor(private readonly activatedRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['idProject'];
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visibleProjectPackage'] && this.visibleProjectPackage) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }

    if (changes['visibleProjectPackage'] && !this.visibleProjectPackage && this.workPackageForm) {
      this.workPackageForm.reset();
    }

    let valueChange = changes['selectedProjectPackage'];
    if (valueChange && !valueChange.firstChange) {
      this.fillForm()
    }
  }

  public onSubmit(): void {
    if (this.workPackageForm.invalid || this.isLoading) return
    const formData = this.workPackageForm.value;
    const body: any = {
      packageNo: formData.packageno,
      packageSerial: formData.packageSerial,
      packageTitle: formData.packageTitle,
      projectId: this.projectId
    }
    if (formData.dates) {
      body.startDate = formData.dates[0];
      body.endDate = formData.dates[1];
    }
    if (this.modalProjectPackageType === 'create') {
      this.projectPackagesUtils.addProjectPage(body).subscribe({
        next: (created) => {
          this.isLoading = false;
          this.closeModal();
          this.createProjectPackage.emit({ created, status: 'success' })
        },
        error: (error) => {
          this.isLoading = false;
          this.createProjectPackage.emit({ status: 'error' });
        }
      })
    }
    else if (this.modalProjectPackageType === 'edit') {
      const updateBody = Object.assign(this.selectedProjectPackage, body);
      this.projectPackagesUtils.updateProjectPackage(updateBody).subscribe({
        next: (edited: ProjectPackage) => {
          this.editedProjectPackage.emit({ edited, status: 'success' })
          this.isLoading = false;
          this.closeModal();
        },
        error: (error: any) => {
          this.isLoading = false;
          this.editedProjectPackage.emit({ status: 'error' });
          if (error instanceof OccError) {
            this.showOCCErrorModalProjectPackage = true;
            this.occErrorProjectPackageType = error.errorType;
          }
        }
      });
    }
  }

  onDeleteConfirm(): void {
    if (!this.packageToDelete) return;
    this.isLoading = true;

    const sub = this.projectPackagesUtils
      .deleteProjectPackage(this.packageToDelete)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.deleteProjectPackageEvent.emit({ status: 'success' })
          this.commonMessagesService.showDeleteSucessfullMessage();
          this.closeModal();
        },
        error: (error: any) => {
          this.isLoading = false;
          this.deleteProjectPackageEvent.emit({ status: 'error' })
          console.log(error.message);
          if (error instanceof OccError || error?.message.includes('404')) {
            this.showOCCErrorModalProjectPackage = true;
            this.occErrorProjectPackageType = 'DELETE_UNEXISTED';
          }
        }
      });
    this.subscriptions.add(sub);
  }

  public fillForm() {
    const formData: any = {
      packageno: this.selectedProjectPackage.packageNo,
      packageSerial: this.selectedProjectPackage.packageSerial,
      dates: [momentCreateDate(this.selectedProjectPackage.startDate), momentCreateDate(this.selectedProjectPackage.endDate)],
      packageTitle: this.selectedProjectPackage.packageTitle,
    }
    this.workPackageForm.patchValue(formData);
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.workPackageForm.reset();
  }

  get isCreateWorkPackageMode(): boolean {
    return this.modalProjectPackageType === 'create' || this.modalProjectPackageType === 'edit';
  }

  private focusInputIfNeeded(): void {
    if (this.isCreateWorkPackageMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 300);
    }
  }
}
