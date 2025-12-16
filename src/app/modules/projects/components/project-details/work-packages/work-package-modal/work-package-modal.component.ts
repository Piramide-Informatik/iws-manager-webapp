import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ProjectPackagesUtils } from '../../../../utils/project-packages.util';
import { ProjectPackage } from '../../../../../../Entities/ProjectPackage';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-modal-project-package',
  standalone: false,
  templateUrl: './work-package-modal.component.html',
  styleUrl: './work-package-modal.component.scss'
})
export class ModalWorkPackageComponent implements OnInit {
  private readonly projectPackagesUtils = inject(ProjectPackagesUtils);

  @Input() modalProjectPackageType: 'create' | 'delete' | 'edit' = 'create';
  @Input() visibleProjectPackage: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createProjectPackage = new EventEmitter<{ created?: ProjectPackage, status: 'success' | 'error' }>();
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

  constructor(private readonly activatedRoute: ActivatedRoute) { }
  
  ngOnInit(): void {
    this.focusInputIfNeeded();
    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['idProject'];
    });
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

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.workPackageForm.reset();
  }

  get isCreateWorkPackageMode(): boolean {
    return this.modalProjectPackageType === 'create';
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