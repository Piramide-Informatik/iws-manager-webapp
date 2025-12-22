import { UserPreferenceService } from './../../../../../Services/user-preferences.service';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ProjectPackage } from '../../../../../Entities/ProjectPackage';
import { UserPreference } from '../../../../../Entities/user-preference';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { PageTitleService } from '../../../../../shared/services/page-title.service';
import { ActivatedRoute } from '@angular/router';
import { ProjectPackagesUtils } from '../../../utils/project-packages.util';
import { ModalWorkPackageComponent } from './work-package-modal/work-package-modal.component';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';
import { momentCreateDate } from '../../../../shared/utils/moment-date-utils';
import { Column } from '../../../../../Entities/column';

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
  private readonly projectPackagesUtils = inject(ProjectPackagesUtils);
  private readonly commonMessageService = inject(CommonMessagesService);
  private subscription!: Subscription;
  public projectId!: string;
  loading: boolean = true;
  tableKey: string = 'ProjectPackages';
  projectpackageList!: any[];
  projectpackageColumns: Column[] = [];
  packageNo: number | null = null;
  selectedPackage: number | null = null;
  projectPackageUserPreferences: UserPreference = {};
  dataKeys = ['packageNo', 'serial', 'packageTitle', 'startDate', 'endDate'];
  public modalProjectPackageType: 'create' | 'delete' | 'edit' = 'create';
  public visibleProjectPackageModal: boolean = false;
  public selectedProjectPackage!: ProjectPackage;

  @ViewChild('ProjectPackageModal') projectPackageDialog!: ModalWorkPackageComponent;

  constructor(private readonly activatedRoute: ActivatedRoute) { }

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
    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['idProject'];
      this.projectPackagesUtils.getAllProjectPackageByProject(this.projectId).subscribe(projectPackages => {
        const result = projectPackages;
        this.transformDates(result);
        this.projectpackageList = this.sortByTitle(result);
      })
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
        classesTHead: ['width-5'],
        header: this.translate.instant(_('PROJECT_PACKAGES.TABLE.PACKAGE_NUMBER')),
      },
      {
        field: 'packageSerial',
        classesTHead: ['width-10'],
        header: this.translate.instant(_('PROJECT_PACKAGES.TABLE.PACKAGE_SERIAL')),
      },
      {
        field: 'packageTitle',
        classesTHead: ['width-60'],
        header: this.translate.instant(_('PROJECT_PACKAGES.TABLE.PACKAGE_NAME')),
      },
      {
        field: 'startDate',
        type: 'date',
        classesTHead: ['width-10'],
        header: this.translate.instant(_('PROJECT_PACKAGES.TABLE.START_DATE')),
        filter: { type: 'date' },
      },
      {
        field: 'endDate',
        type: 'date',
        classesTHead: ['width-10'],
        header: this.translate.instant(_('PROJECT_PACKAGES.TABLE.END_DATE')),
        filter: { type: 'date' },
      },
    ];
  }

  handleProjectpackageTableEvents(event: {
    type: 'create' | 'delete' | 'edit';
    data?: any;
  }): void {
    this.modalProjectPackageType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedPackage = event.data;
      this.packageNo = this.projectpackageList.find(pack => pack.id == this.selectedPackage)?.packageNo ?? null;
    }
    if (event.type === 'edit' && event.data) {
      this.selectedProjectPackage = event.data
    }
    this.visibleProjectPackageModal = true;
  }

  onModalProjectPackageClose() {
    if (this.projectPackageDialog) {
      this.projectPackageDialog.closeModal();
    }
  }

  onModalVisibilityProjectPackageChange(visible: boolean): void {
    this.visibleProjectPackageModal = visible;
  }

  onCreateProjectPackage(event: { created?: ProjectPackage, status: 'success' | 'error' }): void {
    if (event.created && event.status === 'success') {
      const result = [...this.projectpackageList, event.created]
      this.transformDates(result);
      this.commonMessageService.showCreatedSuccesfullMessage();
      this.projectpackageList = this.sortByTitle(result);
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onEditProjectPackage(event: { edited?: ProjectPackage, status: 'success' | 'error' }): void {
    if (event.edited && event.status === 'success') {
      this.projectPackagesUtils.getAllProjectPackageByProject(this.projectId).subscribe(projectPackages => {
        const result = projectPackages;
        this.transformDates(result);
        this.commonMessageService.showEditSucessfullMessage();
        this.projectpackageList = this.sortByTitle(result);
      })
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorEditMessage();
    }
  }

  onDeleteProjectPackage(event: { status: 'success' | 'error', error?: Error }): void {
    if (event.status === 'success') {
      this.projectPackagesUtils.getAllProjectPackageByProject(this.projectId).subscribe(projectPackages => {
        const result = projectPackages;
        this.transformDates(result);
        this.projectpackageList = this.sortByTitle(result);
      });
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorDeleteMessage();
    }
  }

  sortByTitle(data: ProjectPackage[]) {
    return data.sort((a, b) => this.naturalSort(a, b));
  }

  naturalSort(a: any, b: any): number {
    return a.packageNo.localeCompare(b.packageNo, undefined, { 
      numeric: true, 
      sensitivity: 'base' 
    });
  }

  transformDates(data: any) {
    for (let i = 0; i < data.length; i++) {
      data[i].startDate = momentCreateDate(data[i].startDate);
      data[i].endDate = momentCreateDate(data[i].endDate);
    }
  }
}
