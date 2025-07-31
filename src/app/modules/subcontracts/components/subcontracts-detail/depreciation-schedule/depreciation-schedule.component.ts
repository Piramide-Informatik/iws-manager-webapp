import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { SubcontractYearUtils } from '../../../utils/subcontract-year-utils';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';

interface DepreciationEntry {
  id: number;
  year: number;
  usagePercentage: number;
  depreciationAmount: number;
}

@Component({
  selector: 'app-depreciation-schedule',
  standalone: false,
  templateUrl: './depreciation-schedule.component.html',
  styleUrl: './depreciation-schedule.component.scss',
})
export class DepreciationScheduleComponent implements OnInit {
  private readonly subcontractYearUtils = inject(SubcontractYearUtils)
  depreciationForm!: FormGroup;
  depreciationEntries: DepreciationEntry[] = [];

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;

  visibleModal = signal(false);
  option = {
    new: 'New',
    edit: 'Edit',
    delete: 'Delete',
  };
  optionSelected: string = '';
  selectedYear!: number;
  depreciationColumns: any[] = [];
  userDepreciationPreferences: UserPreference = {};
  tableKey: string = 'DepreciationSchedule'
  dataKeys = ['year', 'usagePercentage', 'depreciationAmount']
  modalType!: string;
  protected selectedSubcontractYear!: any;
  isLoading: boolean = false;
  private langSubscription!: Subscription;

  constructor(
    private readonly userPreferenceService: UserPreferenceService,
    private readonly translate: TranslateService,
    private readonly commonMessageService: CommonMessagesService) { }

  ngOnInit(): void {
    this.depreciationEntries = [];

    this.depreciationForm = new FormGroup({
      year: new FormControl('', Validators.required),
      usagePercentage: new FormControl('', Validators.required),
      depreciationAmount: new FormControl('', Validators.required),
    });

    this.loading = false;
    this.loadColumns();
    this.userDepreciationPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.depreciationColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumns();
      this.userDepreciationPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.depreciationColumns);
    });
  }

  onUserDepreciationPreferencesChanges(userDepreciationPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userDepreciationPreferences));
  }

  loadColumns() {
    this.depreciationColumns = [
      { field: 'year', customClasses: ['align-right'], header: this.translate.instant(_('SUB-CONTRACTS.DEPRECIATION_COLUMNS.YEAR')) },
      { field: 'usagePercentage', customClasses: ['align-right'], header: this.translate.instant(_('SUB-CONTRACTS.DEPRECIATION_COLUMNS.SERVICE_LIFE')) },
      { field: 'depreciationAmount', customClasses: ['align-right'], header: this.translate.instant(_('SUB-CONTRACTS.DEPRECIATION_COLUMNS.AFA_BY_YEAR')) },
    ];
  }

  showModal(option: string, year?: number) {
    this.optionSelected = option;

    if (option === this.option.edit && year != null) {
      const entry = this.depreciationEntries.find((d) => d.year === year);
      if (entry) {
        this.depreciationForm.setValue({
          year: entry.year,
          usagePercentage: entry.usagePercentage,
          depreciationAmount: entry.depreciationAmount,
        });
        this.selectedYear = entry.year;
      }
    }

    if (option === this.option.delete) {
      this.selectedSubcontractYear = this.depreciationEntries.find(e => e.id === year);
    }
    this.modalType = option;
    this.visibleModal.set(true);
  }

  closeModal() {
    this.visibleModal.set(false);
    this.depreciationForm.reset();
    this.optionSelected = '';
  }

  saveDepreciation() {
    if (this.depreciationForm.invalid) return;

    const data = this.depreciationForm.value;

    if (this.optionSelected === this.option.new) {
      this.depreciationEntries.push(data);
    } else if (this.optionSelected === this.option.edit) {
      this.depreciationEntries = this.depreciationEntries.map((entry) =>
        entry.year === this.selectedYear ? data : entry
      );
    }

    this.closeModal();
  }

  removeSubcontractYear() {
    if (this.selectedSubcontractYear) {
      this.isLoading = true;
      this.subcontractYearUtils.deleteSubcontractYear(this.selectedSubcontractYear.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.commonMessageService.showDeleteSucessfullMessage();
          this.visibleModal.set(false);
          this.depreciationEntries = this.depreciationEntries.filter( de => de.id !== this.selectedSubcontractYear.id);
          this.selectedSubcontractYear = undefined;
        },
        error: (error) => {
          this.isLoading = false;
          this.commonMessageService.showErrorDeleteMessage();
          this.visibleModal.set(false);
        }
      });
    }
  }
}
