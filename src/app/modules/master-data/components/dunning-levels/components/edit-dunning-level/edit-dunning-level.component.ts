import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ReminderLevel } from '../../../../../../Entities/reminderLevel';
import { DunningLevelUtils } from '../../utils/dunning-level.utils';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-edit-dunning-level',
  standalone: false,
  templateUrl: './edit-dunning-level.component.html',
  styleUrl: './edit-dunning-level.component.scss'
})
export class EditDunningLevelComponent implements OnInit, OnChanges {
  @Input() selectedDunningLevel!: ReminderLevel | null;
  @Output() cancelAction = new EventEmitter();
  private readonly dunningLevelUtils = inject(DunningLevelUtils);
  editDunningLevelForm!: FormGroup;
  isLoading = false;

  constructor( private readonly commonMessageService: CommonMessagesService) {}

  ngOnInit(): void {
    this.editDunningLevelForm = new FormGroup({
      levelNo: new FormControl(''),
      reminderTitle: new FormControl(''),
      fee: new FormControl(''),
      interestRate: new FormControl(''),
      payPeriod: new FormControl(''),
      reminderText: new FormControl('')
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    let dunningLevelChange = changes['selectedDunningLevel'];
    if (dunningLevelChange && !dunningLevelChange.firstChange) {
      this.editDunningLevelForm.patchValue(dunningLevelChange.currentValue);
    }
  }

  onSubmit(): void {
    if(this.editDunningLevelForm.invalid || !this.editDunningLevelForm) return
    if (this.selectedDunningLevel === null) return;
    this.isLoading = true;
    const dunningLevelData = Object.assign(this.selectedDunningLevel, this.editDunningLevelForm.value);
    this.dunningLevelUtils.updateReminderLevel(dunningLevelData).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error) => {
        console.log(error)
        this.isLoading = false;
        this.commonMessageService.showErrorEditMessage();
      }
    });
  }

  public clearForm(): void {
    this.editDunningLevelForm.reset();
    this.selectedDunningLevel = null;
    this.cancelAction.emit(true);
  }
}
