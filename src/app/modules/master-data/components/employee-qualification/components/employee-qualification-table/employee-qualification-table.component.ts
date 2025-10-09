import { Component, computed, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { EmployeeCategory } from '../../../../../../Entities/employee-category ';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

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

  readonly employeeCategories = computed(() => {
    return this.employeeCategoryService.employeeCategories();
  });

  public employeesQualifications: any[] = [];
  public columsHeaderFieldEmployee: any[] = [];
  userEmployeeQualificationPreferences: UserPreference = {};
  tableKey: string = 'EmployeeQualification';
  dataKeys = ['title', 'label'];

  @ViewChild('dt2') dt2!: Table;
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly employeeCategoryStateService: EmployeeCategoryStateService,
    private readonly commonMessageService: CommonMessagesService
  ) {}

  ngOnInit(): void {
    this.loadColHeaders();
    this.userEmployeeQualificationPreferences =
      this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldEmployee);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.routerUtils.reloadComponent(true);
      this.userEmployeeQualificationPreferences =
        this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldEmployee);
    });
  }

  handleTableEvents(event: { type: 'create' | 'delete'; data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedEmployeeQualification = event.data;

      this.NameEmployeeQualification = this.employeeCategories().find(category => category.id === this.selectedEmployeeQualification)?.title ?? '';
    }
    this.visibleModal = true;
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
        field: 'title',
        classesTHead: ['width-50'],
        header: this.translate.instant(_('EMPLOYEE_QUALIFICATION.LABEL.QUALIFICATION')),
        useSameAsEdit: true
      },
      {
        field: 'label',
        classesTHead: ['width-50'],
        header: this.translate.instant(_('EMPLOYEE_QUALIFICATION.LABEL.ABBREVIATION')),
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedEmployeeQualification = null;
    }
  }

  toastMessageDisplay(message: {severity: string, summary: string, detail: string}): void {
    this.commonMessageService.showCustomSeverityAndMessage(
      message.severity,
      message.summary,
      message.detail
    )
  }

  editEmployeeCategory(employeeCategory: EmployeeCategory) {
    this.employeeCategoryStateService.setEmployeeCategoryToEdit(employeeCategory);
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

}
