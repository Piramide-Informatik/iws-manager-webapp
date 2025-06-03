import { Component, ViewChild, OnInit, OnDestroy, computed, SimpleChanges, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { CompanyTypeUtils } from '../../utils/type-of-companies.utils';
import { CompanyTypeService } from '../../../../../../Services/company-type.service';
import { TypeOfCompaniesModalComponent } from '../type-of-companies-modal/company-types-modal.component';
import { CompanyType } from '../../../../../../Entities/companyType';
import { TypeOfCompaniesStateService } from '../../utils/types-of-companies.state.service';

@Component({
  selector: 'app-types-of-companies-table',
  standalone: false,
  templateUrl: './types-of-companies-table.component.html',
  styleUrl: './types-of-companies-table.component.scss'
})
export class TypesOfCompaniesTableComponent implements OnInit, OnDestroy {

  private readonly companyTypeUtils = new CompanyTypeUtils();
  private readonly companyTypeService = inject(CompanyTypeService);
  typeOfCompaniesColumns: any[] = [];
  isTypeOfCompaniesChipVisible = false;
  userTypesOfCompaniesPreferences: UserPreference = {};
  tableKey: string = 'TypesOfCompanies'
  dataKeys = ['name'];
  visibleCompanyTypeModal: boolean = false;
  compnayTypeModalType: 'create' | 'delete' = 'create';
  selectedCompanyType: number | null = null;
  companyTypeName: string = '';
  readonly typeOfCompaniesValues = computed(() => {
    return this.companyTypeService.companyTypes().map(companyType => ({
      id: companyType.id,
      name: companyType.name,
    }));
  });
  @ViewChild('companyTypeModal') companyTypeModalComponent!: TypeOfCompaniesModalComponent;
  @ViewChild('dt') dt!: Table;

  private langTypeOfCompaniesSubscription!: Subscription;

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService, 
              private readonly translate: TranslateService,
              private readonly companyTypeState: TypeOfCompaniesStateService ) { }

  ngOnInit() {
    this.loadTypeOfCompaniesHeadersAndColumns();
    this.userTypesOfCompaniesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.typeOfCompaniesColumns);
    this.langTypeOfCompaniesSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadTypeOfCompaniesHeadersAndColumns();
      this.userTypesOfCompaniesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.typeOfCompaniesColumns);
    });
  }

  handleCompanyTypeTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.compnayTypeModalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedCompanyType = event.data;

      this.companyTypeUtils.getCompanyTypeById(this.selectedCompanyType!).subscribe({
        next: (companyType) => {
          this.companyTypeName = companyType?.name ?? '';
        },
        error: (err) => {
          console.error('No se pudo obtener el tipo de compania:', err);
          this.companyTypeName = '';
        }
      });
    }
    this.visibleCompanyTypeModal = true;
  }

  onUserTypesOfCompaniesPreferencesChanges(userTypesOfCompaniesPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userTypesOfCompaniesPreferences));
  }

  loadTypeOfCompaniesHeadersAndColumns() {
    this.typeOfCompaniesColumns = this.loadTextHeaders();;
  }

  loadTextHeaders(): any[] {
    return [
      {
        field: 'name',
        minWidth: 110,
        header: this.translate.instant(_('TYPE_OF_COMPANIES.TABLE_TYPE_OF_COMPANIES.COMPANY_TYPE'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langTypeOfCompaniesSubscription) {
      this.langTypeOfCompaniesSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['typeOfCompaniesValues']) {
      this.prepareTableData();
    }
  }

  private prepareTableData() {
    if (this.typeOfCompaniesValues().length > 0) {
      this.typeOfCompaniesColumns = [
        {
          field: 'name',
          minWidth: 110,
          header: this.translate.instant(_('TYPE_OF_COMPANIES.TABLE_TYPE_OF_COMPANIES.COMPANY_TYPE'))
        }
      ];
    }
  }

  editCompanyType(companyType: CompanyType) {
    const companyTypeEdit: CompanyType = {
      id: companyType.id,
      name: companyType.name,
      createdAt: '',
      updatedAt: ''
    };

    this.companyTypeUtils.getCompanyTypeById(companyTypeEdit.id).subscribe({
      next: (fullCompanyType) => {
        if (fullCompanyType) {
          this.companyTypeState.setTypeOfCompanyTypeToEdit(fullCompanyType);
        }
      },
      error: (err) => {
        console.error('Error al cargar el tipo de compania:', err);
      }
    });
  }

  onVisibleModal(visible: boolean) {
    this.visibleCompanyTypeModal = visible;
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleCompanyTypeModal = visible;
    if (!visible) {
      this.selectedCompanyType = null;
    }
  }
  onDialogShow() {
    if (this.compnayTypeModalType === 'create' && this.companyTypeModalComponent) {
      this.companyTypeModalComponent.focusCompanyTypeInputIfNeeded();
    }
  }
}
