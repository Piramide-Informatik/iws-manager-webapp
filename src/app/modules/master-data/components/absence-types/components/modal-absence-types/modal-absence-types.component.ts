import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbsenceType } from '../../../../../../Entities/absenceType';
import { AbsenceTypeUtils } from '../../utils/absence-type-utils';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-absence-types',
  standalone: false,
  templateUrl: './modal-absence-types.component.html',
  styleUrl: './modal-absence-types.component.scss'
})
export class ModalAbsenceTypesComponent implements OnChanges {
  private readonly absenceTypeUtils = inject(AbsenceTypeUtils);
  
  @Input() selectedAbsenceType!: AbsenceType;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visible: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createAbsenceType = new EventEmitter<{created?: AbsenceType, status: 'success' | 'error'}>();
  @Output() deleteAbsenceTypeEvent = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;

  public readonly absenceTypeForm = new FormGroup({
    name: new FormControl(''),
    label: new FormControl(''),
    shareOfDay: new FormControl(null, [Validators.max(1.0)]),
    isHoliday: new FormControl(0),
    hours: new FormControl(0),
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible && this.isCreateMode) {
      this.focusInputIfNeeded();
    }
  } 

  public onSubmit(): void {
    if(this.absenceTypeForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newAbsenceType: Omit<AbsenceType, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.absenceTypeForm.value.name ?? '',
      label: this.absenceTypeForm.value.label ?? '',
      shareOfDay: this.absenceTypeForm.value.shareOfDay ?? 0,
      isHoliday: this.absenceTypeForm.value.isHoliday ? 1 : 0,
      hours: this.absenceTypeForm.value.hours ? 1 : 0,
    };

    this.absenceTypeUtils.addAbsenceType(newAbsenceType).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createAbsenceType.emit({created, status: 'success'})
      },
      error: () => {
        this.isLoading = false;
        this.createAbsenceType.emit({status: 'error'})
      }
    })
  }

  public onDelete(): void {
    this.isLoading = true;
    if (this.selectedAbsenceType) {
      this.absenceTypeUtils.deleteAbsenceType(this.selectedAbsenceType.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteAbsenceTypeEvent.emit({status: 'success'});
        },
        error: (error: Error) => {
          this.isLoading = false;
          this.deleteAbsenceTypeEvent.emit({status: 'error', error});
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
      }, 300);
    }
  }
}