import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';

@Component({
  selector: 'app-edit-holiday',
  standalone: false,
  templateUrl: './edit-holiday.component.html',
  styleUrls: ['./edit-holiday.component.scss'],
})
export class EditHolidayComponent implements OnInit {
  holidayForm!: FormGroup;

  bundeslands = [
    { name: 'Baden-Württemberg', selected: true },
    { name: 'Bayern', selected: false },
    { name: 'Berlin', selected: false },
    { name: 'Brandenburg', selected: false },
    { name: 'Bremen', selected: false },
    { name: 'Hamburg', selected: false },
    { name: 'Hessen', selected: false },
    { name: 'Mecklenburg-Vorpommern', selected: false },
    { name: 'Niedersachsen', selected: false },
    { name: 'Nordrhein-Westfalen', selected: false },
    { name: 'Rheinland-Pfalz', selected: false },
    { name: 'Saarland', selected: false },
  ];

  years = [
    { year: 2025, date: new Date(2025, 0, 6) },
    { year: 2024, date: new Date(2024, 0, 6) },
    { year: 2023, date: new Date(2023, 0, 6) },
    { year: 2022, date: new Date(2022, 0, 6) },
    { year: 2021, date: new Date(2021, 0, 6) },
  ];

  constructor(private readonly fb: FormBuilder) {}

  ngOnInit(): void {
    this.holidayForm = this.fb.group({
      name: ['Heilige Drei Könige'],
      sort: [2],
      fixed: [true],
      fixedDate: [new Date()],
      bundeslands: this.fb.array(
        this.bundeslands.map(() => this.fb.control(false))
      ),
    });
  }

  get bundeslandsArray(): FormArray {
    return this.holidayForm.get('bundeslands') as FormArray;
  }

  saveHoliday(): void {
    const formData = this.holidayForm.value;
    const selectedBundeslands = this.bundeslands.filter(
      (_, index) => this.bundeslandsArray.at(index).value
    );

    console.log('Holiday Data:', formData);
    console.log('Selected Bundesländer:', selectedBundeslands);
    console.log('Years:', this.years);
  }

  addYear(): void {
    const nextYear = this.getNextYear();
    const fixedDate = this.holidayForm.get('fixedDate')?.value;

    if (fixedDate) {
      const newDate = new Date(fixedDate);
      newDate.setFullYear(nextYear);

      this.years.push({
        year: nextYear,
        date: newDate,
      });
    }
  }

  private getNextYear(): number {
    if (this.years.length === 0) {
      return new Date().getFullYear();
    }
    const maxYear = Math.max(...this.years.map((y) => y.year));
    return maxYear + 1;
  }

  formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  getControl(index: number): FormControl {
    return this.bundeslandsArray.at(index) as FormControl;
  }
}
