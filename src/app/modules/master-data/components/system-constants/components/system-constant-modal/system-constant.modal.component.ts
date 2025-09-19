import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SystemConstantUtils } from '../../utils/system-constant.utils';
import { System } from '../../../../../../Entities/system';

@Component({
  selector: 'app-system-constant-modal',
  standalone: false,
  templateUrl: './system-constant.modal.component.html',
  styleUrl: './system-constant.modal.component.scss'
})
export class SystemConstantModalComponent implements OnInit, OnChanges {
  private readonly systemConstantUtils = inject(SystemConstantUtils);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedSystemConstant!: System | null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createSystemConstant = new EventEmitter<{created?: System, status: 'success' | 'error'}>();
  @Output() deleteSystemConstant = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public createSystemConstantForm!: FormGroup;
  public isLoading = false;

  constructor(){}

  ngOnInit(): void {
    this.createSystemConstantForm  = new FormGroup({
      name: new FormControl(''),
      valueNum: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      valueChar: new FormControl('', [Validators.pattern('^[a-zA-Z0-9]*$')]),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      this.focusInputIfNeeded();
    }
  }

  onSubmit(): void {
    if(this.createSystemConstantForm.invalid || this.isLoading) return

    this.isLoading = true;
    const systemConstant: Omit<System, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      ...this.createSystemConstantForm.value
    }

    this.systemConstantUtils.createNewSystemConstant(systemConstant).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createSystemConstant.emit({created, status: 'success'});
      },
      error: () => {
        this.isLoading = false;
        this.createSystemConstant.emit({ status: 'error' });
      } 
    })
  }

  onDeleteSystemConstantConfirm() {
    this.isLoading = true;
    if (this.selectedSystemConstant) {
      this.systemConstantUtils.deleteSystemConstant(this.selectedSystemConstant.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteSystemConstant.emit({status: 'success'});
        },
        error: (error) => {
          this.isLoading = false;
          this.deleteSystemConstant.emit({ status: 'error', error: error });
        }
      })
    }
  }

  closeModal() {
    this.createSystemConstantForm.reset();
    this.isVisibleModal.emit(false);
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
