import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-iws-staff-table',
  standalone: false,
  templateUrl: './iws-staff-table.component.html',
  styleUrl: './iws-staff-table.component.scss',
})
export class IwsStaffTableComponent implements OnInit, OnDestroy {
  iwsStaff: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.iwsStaff = [
      {
        id: 1,
        staffNumber: '001',
        firstName: 'Markus',
        lastName: 'Zessin',
        email: 'zessin@iws-world.de',
      },
      {
        id: 2,
        staffNumber: '002',
        firstName: 'Philipp',
        lastName: 'Glockner',
        email: 'glockner@iws-world.de',
      },
      {
        id: 3,
        staffNumber: '003',
        firstName: 'Helga',
        lastName: 'Zacherle',
        email: 'zacherle@iws-world.de',
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
      {
        field: 'staffNumber',
        minWidth: 100,
        header: this.translate.instant(_('IWS_STAFF.TABLE.STAFF_NUMBER')),
      },
      {
        field: 'firstName',
        minWidth: 100,
        header: this.translate.instant(_('IWS_STAFF.TABLE.FIRST_NAME')),
      },
      {
        field: 'lastName',
        minWidth: 100,
        header: this.translate.instant(_('IWS_STAFF.TABLE.LAST_NAME')),
      },
      {
        field: 'email',
        minWidth: 150,
        header: this.translate.instant(_('IWS_STAFF.TABLE.EMAIL')),
      },
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]);
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  editIwsStaff(staff: any) {
    console.log('Editing IWS Staff:', staff);
  }

  deleteIwsStaff(id: number) {
    console.log('Deleting Staff ID:', id);
  }

  createIwsStaff() {
    console.log('Creating new IWS Staff');
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}
