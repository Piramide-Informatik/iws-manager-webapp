import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../../../master-data.service';

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

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
  ){}

  ngOnInit(): void {
    this.editNetworkForm = new FormGroup({
      network: new FormControl('merepa11', [Validators.required])
    });
    
    this.loadColHeadersPartner();
    this.partners = this.masterDataService.getPartnersData();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersPartner();
    });
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
