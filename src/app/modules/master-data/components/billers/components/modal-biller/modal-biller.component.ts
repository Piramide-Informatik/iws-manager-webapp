import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BillerUtils } from '../../utils/biller-utils';
import { Biller } from '../../../../../../Entities/biller';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-modal-biller',
  standalone: false,
  templateUrl: './modal-biller.component.html',
  styleUrl: './modal-biller.component.scss'
})
export class ModalBillerComponent implements OnChanges {
  private readonly billerUtils = inject(BillerUtils);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedBiller!: Biller;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createBiller = new EventEmitter<{created?: Biller, status: 'success' | 'error'}>();
  @Output() deleteBiller = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public isLoading: boolean = false;

  public readonly billerForm = new FormGroup({
    name: new FormControl('')
  });

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.modalType === 'create'){
      this.focusInputIfNeeded();
    }
  }

  onSubmit(): void {
    if(this.billerForm.invalid || this.isLoading) return 
    
    this.isLoading = true;
    const newBiller: Omit<Biller, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.billerForm.value.name ?? ''
    }

    this.billerUtils.addBiller(newBiller).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createBiller.emit({created, status: 'success'});
      },
      error: () => {
        this.isLoading = false;
        this.createBiller.emit({ status: 'error' });
      } 
    })
  }

  removeBiller(): void {
    this.isLoading = true;
    this.billerUtils.deleteBiller(this.selectedBiller.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.deleteBiller.emit({status: 'success'});
      },
      error: (errorDeleteBiller) => {
        this.isLoading = false;
        this.deleteBiller.emit({ status: 'error', error: errorDeleteBiller });
      } 
    })
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.billerForm.reset();
  }

  public focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
