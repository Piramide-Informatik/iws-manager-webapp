import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DunningLevelUtils } from '../../utils/dunning-level.utils';
import { ReminderLevel } from '../../../../../../Entities/reminderLevel';
import { InputNumber } from 'primeng/inputnumber';

@Component({
  selector: 'app-dunning-level-modal',
  standalone: false,
  templateUrl: './dunning-level-modal.component.html',
  styleUrl: './dunning-level-modal.component.scss'
})
export class DunningLevelModalComponent implements OnInit, OnChanges {
  private readonly dunningLevelUtils = inject(DunningLevelUtils);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedDunningLevel!: ReminderLevel | null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createDunningLevel = new EventEmitter<{created?: ReminderLevel, status: 'success' | 'error'}>();
  @Output() deleteDunningLevel = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: InputNumber;
  public dunningLevelForm!: FormGroup;
  public isLoading = false;

  ngOnInit(): void {
    this.dunningLevelForm = new FormGroup({
      levelNo: new FormControl(null),
      reminderTitle: new FormControl(''),
      fee: new FormControl(null),
      interestRate: new FormControl(null, [Validators.min(0), Validators.max(100)]),
      payPeriod: new FormControl(null),
      reminderText: new FormControl('')
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  onSubmit(): void {
    if(this.dunningLevelForm.invalid || this.isLoading) return

    this.isLoading = true;
    const dunningLevel: Omit<ReminderLevel, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      ...this.dunningLevelForm.value
    }

    this.dunningLevelUtils.createNewReminderLevel(dunningLevel).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createDunningLevel.emit({created, status: 'success'});
      },
      error: () => {
        this.isLoading = false;
        this.createDunningLevel.emit({ status: 'error' });
      } 
    })
  }

  closeModal() {
    this.dunningLevelForm.reset();
    this.isVisibleModal.emit(false);
  }

  onDeleteDunningLevelConfirm() {
    this.isLoading = true;
    if (this.selectedDunningLevel) {
      this.dunningLevelUtils.deleteReminderLevel(this.selectedDunningLevel.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteDunningLevel.emit({status: 'success'});
        },
        error: (error) => {
          this.isLoading = false;
          this.deleteDunningLevel.emit({ status: 'error', error: error });
        }
      })
    }
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput.input.nativeElement) {
          this.firstInput.input.nativeElement.focus();
        }
      }, 200);
    }
  }
}
