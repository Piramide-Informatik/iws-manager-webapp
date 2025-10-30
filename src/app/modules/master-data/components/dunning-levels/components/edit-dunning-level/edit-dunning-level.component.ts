import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReminderLevel } from '../../../../../../Entities/reminderLevel';
import { DunningLevelUtils } from '../../utils/dunning-level.utils';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { InputNumber } from 'primeng/inputnumber';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-edit-dunning-level',
  standalone: false,
  templateUrl: './edit-dunning-level.component.html',
  styleUrl: './edit-dunning-level.component.scss'
})
export class EditDunningLevelComponent implements OnInit, OnChanges {
  @Input() selectedDunningLevel!: ReminderLevel | null;
  @Output() cancelAction = new EventEmitter();
  @ViewChild('firstInput') firstInput!: InputNumber;
  @Input() existingDunningLevels: ReminderLevel[] = [];
  private readonly dunningLevelUtils = inject(DunningLevelUtils);
  editDunningLevelForm!: FormGroup;
  isLoading = false;
  public showOCCErrorModalDunningLevel = false;
  public occErrorDunningLevelType: OccErrorType = 'UPDATE_UPDATED';
  
  constructor(private readonly commonMessageService: CommonMessagesService) {}

  ngOnInit(): void {
    this.loadDunningLevelAfterRefresh();
    this.editDunningLevelForm = new FormGroup({
      levelNo: new FormControl(null,[Validators.required]),
      reminderTitle: new FormControl(''),
      fee: new FormControl(null),
      interestRate: new FormControl(null, [Validators.min(0), Validators.max(100)]),
      payPeriod: new FormControl(null),
      reminderText: new FormControl('')
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    let dunningLevelChange = changes['selectedDunningLevel'];
    if (dunningLevelChange && !dunningLevelChange.firstChange) {
      if (dunningLevelChange.currentValue == null) {
        this.clearForm();
      } else {
        this.editDunningLevelForm.patchValue(dunningLevelChange.currentValue);
        this.focusInputIfNeeded();
      }
    }
  }

  onSubmit(): void {
    if(this.editDunningLevelForm.invalid || !this.editDunningLevelForm) return
    if (this.selectedDunningLevel === null) return;
    const levelNo = this.editDunningLevelForm.value.levelNo;
    const isDuplicate = this.existingDunningLevels.some(
      level => level.levelNo === levelNo
    );

    if (isDuplicate) {
      this.commonMessageService.showErrorRecordAlreadyExistWithDunningLevel();
      return;
    }
    this.isLoading = true;
    const dunningLevelFormData = {
      levelNo: this.editDunningLevelForm.value.levelNo,
      reminderTitle: this.editDunningLevelForm.value.reminderTitle?.trim(),
      fee: this.editDunningLevelForm.value.fee,
      interestRate: this.editDunningLevelForm.value.interestRate,
      payPeriod: this.editDunningLevelForm.value.payPeriod,
      reminderText: this.editDunningLevelForm.value.reminderText?.trim()
    }
    const dunningLevelData = Object.assign(this.selectedDunningLevel, dunningLevelFormData);
    this.dunningLevelUtils.updateReminderLevel(dunningLevelData).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error) => {
        console.log(error)
        this.isLoading = false;
        if (error instanceof OccError) { 
          this.showOCCErrorModalDunningLevel = true;
          this.occErrorDunningLevelType = error.errorType;
        }
        this.commonMessageService.showErrorEditMessage();
      }
    });
  }
  public onRefresh(): void {
    if (this.selectedDunningLevel?.id) {
      localStorage.setItem('selectedDunningLevelId', this.selectedDunningLevel.id.toString());
      globalThis.location.reload();
    }
  }

  private loadDunningLevelAfterRefresh(): void {
    const savedDunningLevelId = localStorage.getItem('selectedDunningLevelId');
    if (savedDunningLevelId) {
      const dunningLevelId = Number(savedDunningLevelId);
      this.loadDunningLevel(dunningLevelId);
      localStorage.removeItem('selectedDunningLevelId');
    }
  }

  public loadDunningLevel(dunningLevelId: number) {
    this.dunningLevelUtils.getReminderLevelServiceById(dunningLevelId).subscribe(dunningLevel => {
      if (dunningLevel) {
        this.selectedDunningLevel = dunningLevel;
        this.editDunningLevelForm.patchValue(this.selectedDunningLevel);
        this.focusInputIfNeeded();
      }
    })
  }

  public clearForm(): void {
    this.editDunningLevelForm.reset();
    this.selectedDunningLevel = null;
    this.cancelAction.emit(true);
  }

  private focusInputIfNeeded(): void {
    if (this.selectedDunningLevel && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput.input.nativeElement) {
          this.firstInput.input.nativeElement.focus();
        }
      }, 200);
    }
  }
}