import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Network } from '../../../../../../Entities/network';
import { NetowrkUtils } from '../../utils/ network.utils';

@Component({
  selector: 'app-network-modal',
  standalone: false,
  templateUrl: './network-modal.component.html',
  styleUrl: './network-modal.component.scss'
})
export class NetworkModalComponent {

  private readonly networkUtils = inject(NetowrkUtils)
  @Input() modalType!: string;
  @Input() selectedNetwork!: Network | null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() deleteNetwork = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  public networkForm!: FormGroup;
  public partners!: any[];
  public columsHeaderFieldPartner: any[] = [];
  isLoading = false;

  constructor(){}

  ngOnInit(): void {
    this.networkForm = new FormGroup({
      name: new FormControl('', [Validators.required])
    });
  }

  onSubmit(): void {
    console.log(this.networkForm.value);
  }

  closeModal() {
    this.networkForm.reset();
    this.isVisibleModal.emit(false);
  }

  onDeleteConfirm() {
    this.isLoading = true;
    if (this.selectedNetwork) {
      this.networkUtils.deleteNetwork(this.selectedNetwork.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteNetwork.emit({status: 'success'});
        },
        error: (error) => {
          this.isLoading = false;
          this.deleteNetwork.emit({ status: 'error', error: error });
        }
      })
    }
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }
}
