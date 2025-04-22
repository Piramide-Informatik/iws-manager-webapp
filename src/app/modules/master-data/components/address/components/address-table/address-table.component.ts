import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService, _ } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';

@Component({
  selector: 'master-data-address-table',
  standalone: false,
  templateUrl: './address-table.component.html',
  styleUrl: './address-table.component.scss'
})
export class AddressTableComponent implements OnInit, OnDestroy {
  salutations: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.salutations = [
      {
        id: 1,
        salutation: 'Frau'
      },
      {
        id: 2,
        salutation: 'Herr'
      },
    ];

    this.loadColHeaders();
    this.selectedColumns = [...this.cols];

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.selectedColumns = [...this.cols];
    });
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'anreden', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.TABLE.TYPE')) }
      // { field: 'abbreviation', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.TABLE.ABBREVIATION')) },
      // { field: 'fractionOfDay', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.TABLE.FRACTION_OF_DAY')) },
      // { field: 'isVacation', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.TABLE.IS_VACATION')) },
      // { field: 'canBeBooked', minWidth: 110, header: this.translate.instant(_('ABSENCE_TYPES.TABLE.CAN_BE_BOOKED')) }
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

  editSalutation(salutation: any) {
    console.log('Editing', salutation);
  }

  deleteSalutation(id: number) {
    console.log('Deleting ID', id);
  }

  createSalutation() {
    console.log('Creating new salutation');
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}
