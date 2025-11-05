import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PublicHoliday } from '../../../../../../Entities/publicholiday';
import { HolidayYearUtils } from '../../utils/holiday-year-utils';
import { HolidayYear } from '../../../../../../Entities/holidayYear';
import { momentCreateDate, momentFormatDate } from '../../../../../shared/utils/moment-date-utils';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-new-year',
  standalone: false,
  templateUrl: './new-year.component.html',
  styleUrl: './new-year.component.scss'
})
export class NewYearComponent implements OnChanges {
  private readonly holidayYearUtils = inject(HolidayYearUtils);
  private readonly commonMessageService = inject(CommonMessagesService);

  @Input() currentPublicHolday!: PublicHoliday | null;
  @Input() currentHolidayYear!: HolidayYear | null;
  @Input() modalType: 'create' | 'edit' = 'create';
  @Input() visible: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @ViewChild('datePicker') firstInput!: DatePicker;

  visibleDeleteModal = false;
  public isLoading = false;
  public isLoadingAndNew = false;
  public isLoadingDelete = false;

  public yearForm: FormGroup = new FormGroup({
    year: new FormControl('', [Validators.required]),
    date: new FormControl('')
  });

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible && this.yearForm) {
      this.firstInputFocus();
    }

    if(changes['visible'] && this.visible && this.currentHolidayYear && this.yearForm){
      this.yearForm.patchValue({
        year: momentCreateDate(this.currentHolidayYear.year),
        date: momentCreateDate(this.currentHolidayYear.date)
      });
    }
  }

  onSubmit(typeSumbit?: 'save' | 'saveAndNew'): void {
    if(!this.currentPublicHolday) return;

    if(this.modalType === 'create'){
      this.createHolidayYear(typeSumbit);
    }else{
      this.updateHolidayYear();
    }
  }

  private createHolidayYear(typeSumbit?: 'save' | 'saveAndNew'): void {
    if(typeSumbit === 'save'){this.isLoading = true }else{ this.isLoadingAndNew = true }

    const newHolidayYear: Omit<HolidayYear, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      year: this.yearForm.get('year')?.value,
      date: momentFormatDate(this.yearForm.get('date')?.value) ?? '',
      publicHoliday: this.currentPublicHolday,
      weekday: 1
    }

    this.holidayYearUtils.createHolidayYear(newHolidayYear).subscribe({
      next: () => {
        this.isLoading = this.isLoadingAndNew = false;
        this.commonMessageService.showCreatedSuccesfullMessage();
        typeSumbit === 'save' ? this.onCancel() : this.yearForm.reset();
      },
      error: () => {
        this.isLoading = this.isLoadingAndNew = false;
        this.commonMessageService.showErrorCreatedMessage();
      }
    })
  }

  private updateHolidayYear(): void {
    if(!this.currentHolidayYear) return;

    this.isLoading = true;
    const updatedHolidayYear = {
      ...this.currentHolidayYear,
      year: this.yearForm.get('year')?.value,
      date: this.yearForm.get('date')?.value
    }

    this.holidayYearUtils.updateHolidayYear(updatedHolidayYear).subscribe({
      next: () => {
        this.isLoading = false;
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: () => {
        this.isLoading = false;
        this.commonMessageService.showErrorEditMessage();
      }
    });
  }

  public removeHolidayYear(): void {
    if(!this.currentHolidayYear) return;

    this.isLoadingDelete = true;
    this.holidayYearUtils.deleteHolidayYear(this.currentHolidayYear.id).subscribe({
      next: () => {
        this.isLoadingDelete = false;
        this.commonMessageService.showDeleteSucessfullMessage();
        this.visibleDeleteModal = false;
        this.onCancel();
      },
      error: (error) => {
        this.isLoadingDelete = false;
        console.log(error);
        this.commonMessageService.showErrorDeleteMessage();
      }
    });
  }

  onCancel(): void {
    this.yearForm.reset();
    this.isVisibleModal.emit(false);
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private firstInputFocus(): void {
    setTimeout(() => {
      if (this.firstInput.inputfieldViewChild) {
        this.firstInput.inputfieldViewChild.nativeElement.focus();
      }
    }, 300)
  }
}
