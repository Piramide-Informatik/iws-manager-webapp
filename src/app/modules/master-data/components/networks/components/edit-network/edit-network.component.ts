import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../../../master-data.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'master-data-edit-network',
  standalone: false,
  templateUrl: './edit-network.component.html',
  styleUrl: './edit-network.component.scss'
})
export class EditNetworkComponent {

  public editNetworkForm!: FormGroup;
  public partners!: any[];
  public columsHeaderFieldPartner: any[] = [];
  userPreferences: UserPreference = {};
  tableKey: string = 'EditNetwork'
  dataKeys = ['customerNumber', 'partner'];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly masterDataService: MasterDataService,
  ){}

  ngOnInit(): void {
    this.editNetworkForm = new FormGroup({
      network: new FormControl('merepa11', [Validators.required])
    });
    
    this.loadColHeadersPartner();
    this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldPartner);
    this.partners = this.masterDataService.getPartnersData();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersPartner();
      this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldPartner);
    });
  }

  onUserPreferencesChanges(userPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }

  loadColHeadersPartner(): void {
      this.columsHeaderFieldPartner = [
        { field: 'id', styles: {'width': 'auto'}, header: 'No' },
        { field: 'customerNumber', styles: {'width': 'auto'}, header: this.translate.instant(_('NETWORKS.LABEL.CUSTOMER')) },
        { field: 'partner', styles: {'width': 'auto'}, header: this.translate.instant(_('NETWORKS.LABEL.PARTNER')) },
      ];
    }

  onSubmit(): void {
    console.log(this.editNetworkForm.value);
  }
}
