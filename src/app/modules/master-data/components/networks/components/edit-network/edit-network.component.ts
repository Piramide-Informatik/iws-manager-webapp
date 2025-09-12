import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { NetowrkUtils } from '../../utils/ network.utils';
import { NetworkStateService } from '../../utils/network-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Network } from '../../../../../../Entities/network';

@Component({
  selector: 'master-data-edit-network',
  standalone: false,
  templateUrl: './edit-network.component.html',
  styleUrl: './edit-network.component.scss'
})
export class EditNetworkComponent implements OnInit, OnDestroy {
  private readonly networkUtils = inject(NetowrkUtils);
  private readonly networkStateService = inject(NetworkStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public editNetworkForm!: FormGroup;
  private networkToEdit: Network | null = null;
  public showOCCErrorModalNetwork = false;
  public isLoading: boolean = false;

  // Partner network
  public partners!: any[];
  public columsHeaderFieldPartner: any[] = [];
  userEditNetworkPreferences: UserPreference = {};
  tableKey: string = 'EditNetwork'
  dataKeys = ['customerNumber', 'partner'];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService
  ){}

  ngOnInit(): void {
    this.editNetworkForm = new FormGroup({
      name: new FormControl('')
    });
    this.setupNetworkSubscription();
    // Check if we need to load a network after page refresh for OCC
    const savedNetworkId = localStorage.getItem('selectedNetworkId');
    if (savedNetworkId) {
      this.loadNetworkAfterRefresh(savedNetworkId);
      localStorage.removeItem('selectedNetworkId');
    }
    
    this.loadColHeadersPartner();
    this.userEditNetworkPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldPartner);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersPartner();
      this.userEditNetworkPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldPartner);
    });
  }

  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
    this.subscriptions.unsubscribe();
  }

  onUserEditNetworkPreferencesChanges(userEditNetworkPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userEditNetworkPreferences));
  }

  loadColHeadersPartner(): void {
    this.columsHeaderFieldPartner = [
      { field: 'id', styles: {'width': 'auto'}, header: 'No' },
      { field: 'customerNumber', styles: {'width': 'auto'}, header: this.translate.instant(_('NETWORKS.LABEL.CUSTOMER')) },
      { field: 'partner', styles: {'width': 'auto'}, header: this.translate.instant(_('NETWORKS.LABEL.PARTNER')) },
    ];
  }

  onSubmit(): void {
    if(this.editNetworkForm.invalid || !this.networkToEdit) return

    this.isLoading = true;
    const editedNetwork: Network = {
      ...this.networkToEdit,
      name: this.editNetworkForm.value.name
    }

    this.networkUtils.updateNetwork(editedNetwork).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error: Error) => {
        this.isLoading = false;
        if(error.message === 'Conflict detected: network version mismatch'){
          this.showOCCErrorModalNetwork = true;
        }else{
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  public onRefresh(): void {
    if (this.networkToEdit?.id) {
      localStorage.setItem('selectedNetworkId', this.networkToEdit.id.toString());
      window.location.reload();
    }
  }

  public clearForm(): void {
    this.editNetworkForm.reset();
    this.networkStateService.clearNetwork();
    this.networkToEdit = null;
  }

  private setupNetworkSubscription(): void {
    this.subscriptions.add(
      this.networkStateService.currentNetwork$.subscribe(network => {
        if(network){
          this.networkToEdit = network;
          this.editNetworkForm.patchValue({
            name: this.networkToEdit.name
          });
          this.focusInputIfNeeded();
        }
      })
    )
  }

  private loadNetworkAfterRefresh(networkId: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.networkUtils.getNetworkById(Number(networkId)).subscribe({
        next: (network) => {
          if (network) {
            this.networkStateService.setNetworkToEdit(network);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      })
    );
  }

  public focusInputIfNeeded(): void {
    if (this.networkToEdit && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
