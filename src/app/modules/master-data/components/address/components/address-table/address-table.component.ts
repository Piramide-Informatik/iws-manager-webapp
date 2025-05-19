import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService, _ } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

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
  userAddressPreferences: UserPreference = {};
  tableKey: string = 'Address'
  dataKeys = ['salutation'];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
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
    this.userAddressPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.selectedColumns = [...this.cols];
      this.userAddressPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  onUserAddressPreferencesChanges(userAddressPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userAddressPreferences));
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'salutation', minWidth: 110, header: this.translate.instant(_('ADDRESS.TABLE.SALUTATION')) }
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  editSalutation(salut: any) {
    const indexSalutation = this.salutations.findIndex( salutation => salutation.id == salut.id);
    this.salutations[indexSalutation].salutation = salut.salutation;
  }

  deleteSalutation(id: number) {
    this.salutations = this.salutations.filter( salutation => salutation.id != id);
  }

  createSalutation() {
    console.log('Creating new salutation');
  }
}
