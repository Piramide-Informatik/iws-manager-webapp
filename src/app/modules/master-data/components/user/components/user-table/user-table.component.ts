import { Component } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { MasterDataService } from '../../../../master-data.service';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styles: ``,
  standalone: false,
})
export class UserTableComponent {
  public userUI: any[] = [];
  public columsHeaderFieldUser: any[] = [];
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {
    this.userUI = [
      { username: 'loschu', name: 'Schulte Lothar', active: true },
      { username: 'paze', name: 'Zessin Patrick', active: true },
      { username: 'mariah', name: 'Hernandez Maria', active: false },
      { username: 'jdoe', name: 'Doe John', active: true },
    ];

    this.loadColHeadersUserUI();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersUserUI();
      this.routerUtils.reloadComponent(true);
    });
  }

  loadColHeadersUserUI(): void {
    this.columsHeaderFieldUser = [
      {
        field: 'username',
        styles: { width: '150px' },
        header: this.translate.instant(_('USERS.TABLE.USERNAME')),
      },
      {
        field: 'name',
        styles: { width: 'auto' },
        header: this.translate.instant(_('USERS.TABLE.NAME')),
      },
      {
        field: 'active',
        styles: { width: '80px' },
        header: this.translate.instant(_('USERS.TABLE.ACTIVE')),
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
