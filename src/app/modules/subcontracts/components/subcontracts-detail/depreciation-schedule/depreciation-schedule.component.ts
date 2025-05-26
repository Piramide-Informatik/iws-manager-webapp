import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';

interface DepreciationEntry {
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
  depreciationForm!: FormGroup;
  depreciationEntries: DepreciationEntry[] = [];

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;

  visibleModal = signal(false);
  option = {
    new: 'New',
    edit: 'Edit',
  };
  optionSelected: string = '';
  selectedYear!: number;
  depreciationColumns: any[] = [];
  userDepreciationPreferences: UserPreference = {};
  tableKey: string = 'DepreciationSchedule'
  dataKeys = ['year', 'usagePercentage', 'depreciationAmount']

  constructor(private readonly userPreferenceService: UserPreferenceService) { }

  ngOnInit(): void {
    this.depreciationEntries = [
      {
        year: 2025,
        usagePercentage: 40,
        depreciationAmount: 3000,
      },
      {
        year: 2026,
        usagePercentage: 30,
        depreciationAmount: 2250,
      },
      {
        year: 2027,
        usagePercentage: 20,
        depreciationAmount: 1500,
      },
      {
        year: 2028,
        usagePercentage: 10,
        depreciationAmount: 750,
      },
      {
        year: 2029,
        usagePercentage: 5,
        depreciationAmount: 375,
      },
    ];

    this.depreciationForm = new FormGroup({
      year: new FormControl('', Validators.required),
      usagePercentage: new FormControl('', Validators.required),
      depreciationAmount: new FormControl('', Validators.required),
    });

    this.loading = false;
    this.depreciationColumns = [
      { field: 'year', customClasses: ['align-right'], header: 'Jahr' },
      { field: 'usagePercentage', customClasses: ['align-right'], header: 'Nutzungsanteil %' },
      { field: 'depreciationAmount', customClasses: ['align-right'], header: 'AfA im Jahr' },
    ];
    this.userDepreciationPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.depreciationColumns);
  }

  onUserDepreciationPreferencesChanges(userDepreciationPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userDepreciationPreferences));
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

  deleteDepreciation(year: number) {
    this.depreciationEntries = this.depreciationEntries.filter(
      (entry) => entry.year !== year
    );
  }
}
