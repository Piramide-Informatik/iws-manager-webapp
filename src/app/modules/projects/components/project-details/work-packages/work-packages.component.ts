import { UserPreferenceService } from './../../../../../Services/user-preferences.service';
import { Component, inject, OnInit } from '@angular/core';
import { ProjectPackage } from '../../../../../Entities/ProjectPackage';
import { UserPreference } from '../../../../../Entities/user-preference';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PageTitleService } from '../../../../../shared/services/page-title.service';

@Component({
  selector: 'app-work-packages',
  standalone: false,
  templateUrl: './work-packages.component.html',
  styleUrl: './work-packages.component.scss',
})
export class WorkPackagesComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly pageTitleService = inject(PageTitleService);

  private subscription!: Subscription;

  loading: boolean = true;
  tableKey: string = 'ProjectPackages';
  projectpackageList!: ProjectPackage[];
  projectpackageColumns: any[] = [];
  projectPackageUserPreferences: UserPreference = {};
  dataKeys = ['packageNo', 'serial', 'packageTitle', 'startDate', 'endDate'];

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.PROJECT.NEW_PROJECT');
    this.loadColumns();
    this.projectPackageUserPreferences =
      this.userPreferenceService.getUserPreferences(
        this.tableKey,
        this.projectpackageColumns
      );
    this.loading = false;
    this.subscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumns();
      this.projectPackageUserPreferences =
        this.userPreferenceService.getUserPreferences(
          this.tableKey,
          this.projectpackageColumns
        );
    });
  }

  onWorkPackagesUserPreferencesChanges(userAllocationsPreferences: any) {
    localStorage.setItem(
      'userPreferences',
      JSON.stringify(userAllocationsPreferences)
    );
  }

  loadColumns() {
    this.projectpackageColumns = [
      {
        field: 'packageNo',
        useSameAsEdit: true,
        header: this.translate.instant(_('PROJECT_PACKAGES.TABLE.PACKAGE_NUMBER')),
      },
      {
        field: 'serial',
        type: 'double',
        customClasses: ['align-right'],
        header: this.translate.instant(_('PROJECT_PACKAGES.TABLE.PACKAGE_SERIAL')),
        filter: { type: 'numeric' },
      },
      {
        field: 'packageTitle',
        type: 'string',
        header: this.translate.instant(_('PROJECT_PACKAGES.TABLE.PACKAGE_NAME')),
        filter: { type: 'text' },
      },
      {
        field: 'startDate',
        type: 'date',
        header: this.translate.instant(_('PROJECT_PACKAGES.TABLE.START_DATE')),
        filter: { type: 'date' },
      },
      {
        field: 'endDate',
        type: 'date',
        header: this.translate.instant(_('PROJECT_PACKAGES.TABLE.END_DATE')),
        filter: { type: 'date' },
      },
    ];
  }

  handleProjectpackageTableEvents(event: {
    type: 'create' | 'delete' | 'edit';
    data?: any;
  }): void {
    // implement handling function
  }
}
