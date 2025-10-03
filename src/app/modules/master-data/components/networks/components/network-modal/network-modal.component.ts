import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Network } from '../../../../../../Entities/network';
import { NetowrkUtils } from '../../utils/ network.utils';

@Component({
  selector: 'app-network-modal',
  standalone: false,
  templateUrl: './network-modal.component.html',
  styleUrl: './network-modal.component.scss'
})
export class NetworkModalComponent implements OnInit, OnChanges {
  private readonly networkUtils = inject(NetowrkUtils);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedNetwork!: Network | null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createNetwork = new EventEmitter<{created?: Network, status: 'success' | 'error'}>();
  @Output() deleteNetwork = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public networkForm!: FormGroup;
  public isLoading = false;

  public partners!: any[];
  public columsHeaderFieldPartner: any[] = [];

  constructor(){}

  ngOnInit(): void {
    this.networkForm = new FormGroup({
      name: new FormControl('')
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      this.focusInputIfNeeded();
    }
  }

  onSubmit(): void {
    if(this.networkForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newNetwork: Omit<Network, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.networkForm.value.name?.trim()
    }

    this.networkUtils.createNewNetwork(newNetwork).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createNetwork.emit({created, status: 'success'});
      },
      error: () => {
        this.isLoading = false;
        this.createNetwork.emit({ status: 'error' });
      } 
    })
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

  private focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
