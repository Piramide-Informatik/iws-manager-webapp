import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Text } from '../../../../../../Entities/text';
import { TextUtils } from '../../utils/text-utils';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-text-modal',
  standalone: false,
  templateUrl: './text-modal.component.html',
  styleUrl: './text-modal.component.scss'
})
export class TextModalComponent implements OnInit, OnChanges {
  private readonly textUtils = inject(TextUtils);
  @Input() visible: boolean = false;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedText!: Text;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createText = new EventEmitter<{created?: Text, status: 'success' | 'error'}>();
  @Output() deleteText = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public isLoading: boolean = false;

  public readonly textForm = new FormGroup({
    label: new FormControl(''),
    content: new FormControl('')
  });

  ngOnInit(): void {
    this.textForm.get('label')?.disable();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.modalType === 'create'){
      this.focusInputIfNeeded();
    }
  }

  onSubmit(): void {
    if(this.textForm.invalid || this.isLoading) return 
    
    this.isLoading = true;
    const newText: Omit<Text, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      label: this.textForm.value.label ?? '',
      content: this.textForm.value.content ?? ''
    }

    this.textUtils.addText(newText).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createText.emit({created, status: 'success'});
      },
      error: () => {
        this.isLoading = false;
        this.createText.emit({ status: 'error' });
      } 
    })
  }

  deleteSelectedText() {
    this.isLoading = true;
    if (this.selectedText) {
      this.textUtils.deleteText(this.selectedText.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteText.emit({status: 'success'});
        },
        error: (error) => {
          this.isLoading = false;
          this.deleteText.emit({ status: 'error', error: error });
        }
      })
    }
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.textForm.reset();
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
