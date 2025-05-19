import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from "@ngx-translate/core";
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';


@Component({
  selector: 'app-absence-types-table',
  standalone: false,
  templateUrl: './absence-types-table.component.html',
  styleUrl: './absence-types-table.component.scss'
})
export class AbsenceTypesTableComponent implements OnInit, OnDestroy {
  absenceTypes: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];
  userPreferences: UserPreference = {};
  tableKey: string = 'AbsenceType'
  dataKeys = ['type', 'abbreviation', 'fractionOfDay', 'isVacation', 'canBeBooked'];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(private readonly translate: TranslateService, private readonly userPreferenceService: UserPreferenceService, private readonly router: Router) { }

  ngOnInit() {
    this.absenceTypes = [
      {
        id: 1,
        type: 'Gemeldet krank',
        abbreviation: 'Gk',
        fractionOfDay: '',
        isVacation: '',
        canBeBooked: '',
      },
      {
        id: 2,
        type: 'Sonderurbaub',
        abbreviation: 'X',
        fractionOfDay: 'x',
        isVacation: '',
        canBeBooked: '',
      },
    ];

    this.loadColHeaders();
    this.selectedColumns = [...this.cols];
    this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.selectedColumns = [...this.cols];
      this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  onUserPreferencesChanges(userPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'type', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.TYPE')) },
      { field: 'abbreviation', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.ABBREVIATION')) },
      { field: 'fractionOfDay', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.FRACTION_OF_DAY')) },
      { field: 'isVacation', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.IS_VACATION')) },
      { field: 'canBeBooked', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.LABEL.CAN_BE_BOOKED')) }
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  editAbsenceType(absenceType: any) {
    console.log('Editing', absenceType);
  }

  deleteAbsenceType(id: number) {
    console.log('Deleting ID', id);
  }

  createAbsenceType() {
    console.log('Creating new absence type');
  }
}
