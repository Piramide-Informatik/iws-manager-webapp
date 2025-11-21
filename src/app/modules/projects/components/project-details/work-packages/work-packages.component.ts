import { UserPreferenceService } from './../../../../../Services/user-preferences.service';
import { Component, inject, OnInit } from '@angular/core';
import { ProjectPackage } from '../../../../../Entities/ProjectPackage';
import { UserPreference } from '../../../../../Entities/user-preference';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-work-packages',
  standalone: false,
  templateUrl: './work-packages.component.html',
  styleUrl: './work-packages.component.scss',
})
export class WorkPackagesComponent implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);

  private subscription!: Subscription;

  loading: boolean = true;
  tableKey: string = 'ProjectPackages';
  projectpackageList!: ProjectPackage[];
  projectpackageColumns: any[] = [];
  projectPackageUserPreferences: UserPreference = {};
  dataKeys = ['packageNo', 'serial', 'packageTitle', 'startDate', 'endDate'];

  ngOnInit(): void {
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
        header: this.translate.instant(_('PROJECT_PACKAGES.PACKAGE_NUMBER')),
      },
      {
        field: 'serial',
        type: 'double',
        customClasses: ['align-right'],
        header: this.translate.instant(_('PROJECT_PACKAGES.PACKAGE_SERIAL')),
        filter: { type: 'numeric' },
      },
      {
        field: 'packageTitle',
        type: 'string',
        customClasses: ['align-right'],
        header: this.translate.instant(_('PROJECT_PACKAGES.PACKAGE_NAME')),
        filter: { type: 'text' },
      },
      {
        field: 'startDate',
        type: 'date',
        customClasses: ['align-right'],
        header: this.translate.instant(_('PROJECT_PACKAGES.START_DATE')),
        filter: { type: 'date' },
      },
      {
        field: 'endDate',
        type: 'date',
        customClasses: ['align-right'],
        header: this.translate.instant(_('PROJECT_PACKAGES.END_DATE')),
        filter: { type: 'date' },
      },
    ];
  }

  handleProjectpackageTableEvents(event: {
    type: 'create' | 'delete' | 'edit';
    data?: any;
  }): void {}
}
