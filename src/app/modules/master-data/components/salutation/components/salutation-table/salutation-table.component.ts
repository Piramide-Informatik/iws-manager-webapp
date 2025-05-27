import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService, _ } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'master-data-salutation-table',
  standalone: false,
  templateUrl: './salutation-table.component.html',
  styleUrl: './salutation-table.component.scss'
})
export class SalutationTableComponent implements OnInit, OnDestroy {
  salutations: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];
  userAddressPreferences: UserPreference = {};
  tableKey: string = 'Address'
  dataKeys = ['salutation'];
  visibleModal: boolean = false;
  salutationToEdit!:string;

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

  editSalutation(salut: string) {
    this.visibleModal = true;
    this.salutationToEdit = salut;
  }

  deleteSalutation(id: number) {
    this.salutations = this.salutations.filter( salutation => salutation.id != id);
  }

  createSalutation(salut:any) {
    this.salutations.push({
      id: this.salutations.length,
      salutation: salut['salutation']
    })
  }

  onVisibleModal(visible: boolean){
    this.visibleModal = visible;
  }
}
