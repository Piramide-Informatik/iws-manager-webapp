import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Table } from 'primeng/table';

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

  ngOnInit(): void {
    this.depreciationForm = new FormGroup({
      year: new FormControl('', Validators.required),
      usagePercentage: new FormControl('', Validators.required),
      depreciationAmount: new FormControl('', Validators.required),
    });

    this.loading = false;
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
