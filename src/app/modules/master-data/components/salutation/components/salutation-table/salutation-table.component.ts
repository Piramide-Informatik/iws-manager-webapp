import { Component, OnDestroy, OnInit, SimpleChanges, ViewChild, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService, _ } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { SalutationUtils } from '../../utils/salutation.utils';
import { SalutationService } from '../../../../../../Services/salutation.service';
import { Salutation } from '../../../../../../Entities/salutation';

@Component({
  selector: 'master-data-salutation-table',
  standalone: false,
  templateUrl: './salutation-table.component.html',
  styleUrl: './salutation-table.component.scss'
})
export class SalutationTableComponent implements OnInit, OnDestroy {

  private readonly salutationUtils = new SalutationUtils();
  private readonly salutationService = inject(SalutationService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedSalutation: number | null = null;
  salutationName: string = '';

  salutationColumns: any[] = [];
  salutationDisplayedColumns: any[] = [];
  isChipsVisible = false;
  userSalutationPreferences: UserPreference = {};
  tableKey: string = 'Salutation';
  dataKeys = ['salutation'];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  readonly salutations = computed(() => {
    return this.salutationService.salutations().map(salutation => ({
      id: salutation.id,
      salutation: salutation.name,
    }));
  });

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadSalutationHeadersAndColumns();
    this.userSalutationPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.salutationDisplayedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadSalutationHeadersAndColumns();
      this.userSalutationPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.salutationDisplayedColumns);
    });
  }

  onUserSalutationPreferencesChanges(userSalutationPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userSalutationPreferences));
  }

  loadSalutationHeadersAndColumns() {
    this.loadSalutationHeaders();
    this.salutationDisplayedColumns = this.salutationColumns.filter(col => col.field !== 'label');
  }

  loadSalutationHeaders(): void {
    this.salutationColumns = [
      { field: 'salutation', minWidth: 110, header: this.translate.instant(_('ADDRESS.TABLE.SALUTATION')) }
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['salutations']) {
      this.prepareTableData();
    }
  }

  private prepareTableData() {
    if (this.salutations().length > 0) {
      this.salutationDisplayedColumns = [
        { field: 'name', header: 'Salutation' }
      ];
    }
  }

  applySalutationFilter(event: any, field: string) {
    const inputSalutationFilterElement = event.target as HTMLInputElement;
    if (inputSalutationFilterElement) {
      this.dt2.filter(inputSalutationFilterElement.value, field, 'contains');
    }
  }

  editSalutation(salutation: Salutation) {
    const salutationToEdit: Salutation = {
      id: salutation.id,
      name: salutation.name,
      createdAt: '',
      updatedAt: ''
    };

    this.salutationUtils.getSalutationById(salutationToEdit.id).subscribe({
      next: (fullSalutation) => {
        if (fullSalutation) {
          //this.salutationStateService.setSalutationToEdit(fullSalutation);
        }
      },
      error: (err) => {
        console.error('Error to load Salutation:', err);
      }
    });
  }

  onVisibleModal(visible: boolean){
    this.visibleModal = visible;
  }
  
  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if(!visible) {
      this.selectedSalutation = null;
    }
  }
}
