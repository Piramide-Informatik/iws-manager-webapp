import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

import { EmployeeCategoryStateService } from '../../utils/employee-category-state.service';
import { EmployeeCategoryService } from '../../../../../../Services/employee-category.service';
import { EmployeeCategoryUtils } from '../../utils/employee-category-utils';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { EmployeeQualificationModalComponent } from '../employee-qualification-modal/employee-qualification-modal.component';
import { EmployeeCategory } from '../../../../../../Entities/employee-category ';

@Component({
  selector: 'app-employee-qualification-table',
  standalone: false,
  templateUrl: './employee-qualification-table.component.html',
  styleUrl: './employee-qualification-table.component.scss',
})
export class EmployeeQualificationTableComponent implements OnInit, OnDestroy {
  private readonly employeeCategoryUtils = new EmployeeCategoryUtils();
  private readonly employeeCategoryService = inject(EmployeeCategoryService);
  private readonly messageService = inject(MessageService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedEmployeeQualification: number | null = null;
  NameEmployeeQualification: string = '';
  @ViewChild('employeeQualificationModalComponent')
  employeeQualificationModalComponent!: EmployeeQualificationModalComponent;
  handleTableEvents(event: { type: 'create' | 'delete'; data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedEmployeeQualification = event.data;

      this.employeeCategoryUtils
        .getEmployeeCategoryById(this.selectedEmployeeQualification!)
        .subscribe({
          next: (employeeQualification) => {
            this.NameEmployeeQualification = employeeQualification?.title ?? '';
          },
          error: (err) => {
            console.error('Could not get employeeIws:', err);
            this.NameEmployeeQualification = '';
          },
        });
    }
    this.visibleModal = true;
  }

  readonly employeeCategories = computed(() => {
    return this.employeeCategoryService
      .employeeCategories()
      .map((employeeCategory) => ({
        id: employeeCategory.id,
        qualification: employeeCategory.title,
        abbreviation: employeeCategory.label,
      }));
  });

  public employeesQualifications: any[] = [];
  public columsHeaderFieldEmployee: any[] = [];
  userEmployeeQualificationPreferences: UserPreference = {};
  tableKey: string = 'EmployeeQualification';
  dataKeys = ['qualification', 'abbreviation'];

  @ViewChild('dt2') dt2!: Table;
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly employeeCategoryStateService: EmployeeCategoryStateService
  ) {}

  ngOnInit(): void {
    this.loadColHeaders();
    this.userEmployeeQualificationPreferences =
      this.userPreferenceService.getUserPreferences(
        this.tableKey,
        this.columsHeaderFieldEmployee
      );
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.routerUtils.reloadComponent(true);
      this.userEmployeeQualificationPreferences =
        this.userPreferenceService.getUserPreferences(
          this.tableKey,
          this.columsHeaderFieldEmployee
        );
    });
  }

  onUserEmployeeQualificationPreferencesChanges(
    userEmployeeQualificationPreferences: any
  ) {
    localStorage.setItem(
      'userPreferences',
      JSON.stringify(userEmployeeQualificationPreferences)
    );
  }

  loadColHeaders(): void {
    this.columsHeaderFieldEmployee = [
      {
        field: 'qualification',
        styles: { width: 'auto' },
        header: this.translate.instant(
          _('EMPLOYEE_QUALIFICATION.LABEL.QUALIFICATION')
        ),
      },
      {
        field: 'abbreviation',
        styles: { width: 'auto' },
        header: this.translate.instant(
          _('EMPLOYEE_QUALIFICATION.LABEL.ABBREVIATION')
        ),
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onDialogShow() {
    if (this.modalType === 'create' && this.employeeQualificationModalComponent) {
      this.employeeQualificationModalComponent.focusInputIfNeeded();
    }
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedEmployeeQualification = null;
    }
  }

  toastMessageDisplay(message: {severity: string, summary: string, detail: string}): void {
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    });
  }

  editEmployeeCategory(employeeCategory: EmployeeCategory) {
        const EmployeeCategoryToEdit: EmployeeCategory = {
          id: employeeCategory.id,
          title: employeeCategory.title,
          label: employeeCategory.label,
          createdAt: '',
          updatedAt: '',
          version: 0,
        };
        this.employeeCategoryUtils
          .getEmployeeCategoryById(EmployeeCategoryToEdit.id)
          .subscribe({
            next: (fullEmployeeCategory) => {
              if (fullEmployeeCategory) {
                this.employeeCategoryStateService.setPEmployeeCategoryToEdit(
                  fullEmployeeCategory
                );
              }
            },
            error: (err) => {
              console.error('Error Id EmployeeCategory', err);
            },
          });
      }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

}
