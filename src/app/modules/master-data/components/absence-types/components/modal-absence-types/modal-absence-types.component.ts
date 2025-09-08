import { Component, ElementRef, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { AbsenceType } from '../../../../../../Entities/absenceType';
import { AbsenceTypeUtils } from '../../utils/absence-type-utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-absence-types',
  standalone: false,
  templateUrl: './modal-absence-types.component.html',
  styleUrl: './modal-absence-types.component.scss'
})
export class ModalAbsenceTypesComponent {
  private readonly absenceTypeUtils = inject(AbsenceTypeUtils);
  @Input() selectedAbsenceType!: AbsenceType | undefined;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() onCreateAbsenceType = new EventEmitter<{created?: AbsenceType, status: 'success' | 'error'}>();
  @Output() onDeleteAbsenceType = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;

  public readonly absenceTypeForm = new FormGroup({
    name: new FormControl(''),
    label: new FormControl(''),
    shareOfDay: new FormControl(null, [Validators.max(1.0)]),
    hours: new FormControl(0),
    isHoliday: new FormControl(0)
  })

  public onSubmit(): void {
    if(this.absenceTypeForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newAbsenceType: Omit<AbsenceType, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.absenceTypeForm.value.name ?? '',
      label: this.absenceTypeForm.value.label ?? '',
      shareofday: this.absenceTypeForm.value.shareOfDay ?? 0,
      isHoliday: this.absenceTypeForm.value.isHoliday ? 1 : 0,
      hours: this.absenceTypeForm.value.hours ? 1 : 0,
    };

    this.absenceTypeUtils.addAbsenceType(newAbsenceType).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.onCreateAbsenceType.emit({created, status: 'success'})
      },
      error: () => {
        this.isLoading = false;
        this.onCreateAbsenceType.emit({status: 'error'})
      }
    })
  }

  public onDeleteConfirm(): void {
    this.isLoading = true;
    if (this.selectedAbsenceType) {
      this.absenceTypeUtils.deleteAbsenceType(this.selectedAbsenceType.id).subscribe({
        next: () => {
          this.onDeleteAbsenceType.emit({status: 'success'});
        },
        error: (error: Error) => {
          this.isLoading = false;
          this.onDeleteAbsenceType.emit({status: 'error', error});
        },
        complete: () => {
          this.isLoading = false;
          this.closeModal();
          this.selectedAbsenceType = undefined;
        }
      })
    }
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.absenceTypeForm.reset();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  public focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 150);
    }
  }

}
