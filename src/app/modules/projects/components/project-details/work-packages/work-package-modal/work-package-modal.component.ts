import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectPackagesUtils } from '../../../../utils/project-packages.util';
import { ProjectPackage } from '../../../../../../Entities/ProjectPackage';
import { ActivatedRoute } from '@angular/router';
import { Subscription, take } from 'rxjs';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { momentCreateDate } from '../../../../../shared/utils/moment-date-utils';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { formatDate } from '@angular/common';

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
  public isLoadingDelete: boolean = false;
  dateFormatPicker: string = 'dd.mm.yy';
  public workPackageForm = new FormGroup({
    packageno: new FormControl('', [Validators.required]),
    packageSerial: new FormControl(''),
    packageTitle: new FormControl('', [Validators.required]),
    dates: new FormControl([]),
  });
  projectId = '';
  public showOCCErrorModalProjectPackage = false;
  public packageNumberAlreadyExists = false;
  public packageNameAlreadyExists = false;
  public occErrorProjectPackageType: OccErrorType = 'UPDATE_UNEXISTED';
  visiblWorkPackageModal = false;
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

    let valueChange = changes['selectedProjectPackage'];
    if (valueChange || changes['visibleProjectPackage'] && this.modalProjectPackageType === 'edit') {
      if (this.selectedProjectPackage) {
        this.fillForm()
      }
    }

    if (changes['visibleProjectPackage'] && !this.visibleProjectPackage && this.workPackageForm) {
      this.workPackageForm.reset();
    }

  }

  public onSubmit(): void {
    if (this.workPackageForm.invalid || this.isLoading) return;

    this.isLoading = true;
    const formData = this.workPackageForm.value;
    const body: any = {
      packageNo: formData.packageno,
      packageSerial: formData.packageSerial,
      packageTitle: formData.packageTitle,
      projectId: this.projectId
    }
    if (formData.dates) {
      body.endDate = formatDate(formData.dates[1], 'yyyy-MM-dd', 'en-US'),
      body.startDate = formatDate(formData.dates[0], 'yyyy-MM-dd', 'en-US')
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
          this.handleErrorDuplicate(error);
          this.createProjectPackage.emit({ status: 'error' });
        }
      })
    }
    else if (this.modalProjectPackageType === 'edit') {
      const updateBody = { ...this.selectedProjectPackage, ...body };
      if (!formData.dates) {
        updateBody.startDate = null;
        updateBody.endDate = null;
      }
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
          } else {
            this.handleErrorDuplicate(error);
          }
        }
      });
    }
  }

  private handleErrorDuplicate(error: any): void {
    if (error.error.message.includes("duplication with attribute 'packageNo'")) {
      this.packageNumberAlreadyExists = true;
      this.workPackageForm.get('packageno')?.valueChanges.pipe(take(1))
        .subscribe(() => this.packageNumberAlreadyExists = false);
    } else if (error.error.message.includes("duplication with attribute 'packageTitle'")) {
      this.packageNameAlreadyExists = true;
      this.workPackageForm.get('packageTitle')?.valueChanges.pipe(take(1))
        .subscribe(() => this.packageNameAlreadyExists = false);
    } else if (error.error.message.includes("duplication with attributes")) {
      this.packageNumberAlreadyExists = true;
      this.workPackageForm.get('packageno')?.valueChanges.pipe(take(1))
        .subscribe(() => this.packageNumberAlreadyExists = false);
      this.packageNameAlreadyExists = true;
      this.workPackageForm.get('packageTitle')?.valueChanges.pipe(take(1))
        .subscribe(() => this.packageNameAlreadyExists = false);
    }
  }

  deleteWorkPackage() {
    this.packageToDelete = this.selectedProjectPackage.id
    this.onDeleteConfirm()
  }

  onDeleteConfirm(): void {
    if (!this.packageToDelete) return;
    this.isLoadingDelete = true;

    const sub = this.projectPackagesUtils
      .deleteProjectPackage(this.packageToDelete)
      .subscribe({
        next: () => {
          this.isLoadingDelete = false;
          this.deleteProjectPackageEvent.emit({ status: 'success' })
          this.commonMessagesService.showDeleteSucessfullMessage();
          this.selectedProjectPackage = null;
          this.closeModal();
        },
        error: (error: any) => {
          this.isLoadingDelete = false;
          this.deleteProjectPackageEvent.emit({ status: 'error' })
          console.log(error.message);
          this.visiblWorkPackageModal = false;
          if (error instanceof OccError || error?.message.includes('404')) {
            this.showOCCErrorModalProjectPackage = true;
            this.occErrorProjectPackageType = 'DELETE_UNEXISTED';
          }
        }
      });
    this.subscriptions.add(sub);
  }

  public fillForm() {
    const dateArray: any = [];
    if (this.selectedProjectPackage.startDate) {
      dateArray.push(momentCreateDate(this.selectedProjectPackage.startDate));
    }
    if (this.selectedProjectPackage.endDate) {
      dateArray.push(momentCreateDate(this.selectedProjectPackage.endDate));
    }
    const formData: any = {
      packageno: this.selectedProjectPackage.packageNo,
      packageSerial: this.selectedProjectPackage.packageSerial,
      dates: dateArray.length > 0 ? dateArray : [],
      packageTitle: this.selectedProjectPackage.packageTitle,
    }
    this.workPackageForm.patchValue(formData);
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.workPackageForm.reset();
    this.visiblWorkPackageModal = false;
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
