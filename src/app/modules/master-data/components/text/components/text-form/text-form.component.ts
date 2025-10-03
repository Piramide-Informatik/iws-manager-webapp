import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Text } from '../../../../../../Entities/text';
import { TextUtils } from '../../utils/text-utils';
import { TextStateService } from '../../utils/text-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-text-form',
  standalone: false,
  templateUrl: './text-form.component.html',
  styleUrl: './text-form.component.scss'
})
export class TextFormComponent implements OnInit, OnDestroy {
  private readonly textUtils = inject(TextUtils);
  private readonly textStateService = inject(TextStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public textToEdit: Text | null = null;
  public showOCCErrorModalText = false;
  public isLoading: boolean = false;
  public editTextForm!: FormGroup;

  ngOnInit(): void {
    this.editTextForm = new FormGroup({
      label: new FormControl({value: '', disabled: true}),
      content: new FormControl('')
    });
    this.setupTextSubscription();
    // Check if we need to load an text after page refresh for OCC
    const savedTextId = localStorage.getItem('selectedTextId');
    if (savedTextId) {
      this.loadTextAfterRefresh(savedTextId);
      localStorage.removeItem('selectedTextId');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.editTextForm.invalid || !this.textToEdit) return

    this.isLoading = true;
    const editedText: Text = {
      ...this.textToEdit,
      label: this.editTextForm.getRawValue().label,
      content: this.editTextForm.value.content?.trim() ?? ''
    }

    this.textUtils.updateText(editedText).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error: Error) => {
        this.isLoading = false;
        if(error.message === 'Version conflict: Text has been updated by another user'){
          this.showOCCErrorModalText = true;
        }else{
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  private setupTextSubscription(): void {
    this.subscriptions.add(
      this.textStateService.currentText$.subscribe(text => {
        if(text){
          this.textToEdit = text;
          this.editTextForm.patchValue({
            label: this.textToEdit.label,
            content: this.textToEdit.content
          });
          this.focusInputIfNeeded();
        } else {
          this.editTextForm.reset();
        }
      })
    )
  }

  public onRefresh(): void {
    if (this.textToEdit?.id) {
      localStorage.setItem('selectedTextId', this.textToEdit.id.toString());
      window.location.reload();
    }
  }

  public clearForm(): void {
    this.editTextForm.reset();
    this.textStateService.clearText();
    this.textToEdit = null;
  }

  private loadTextAfterRefresh(textId: string): void {
    this.isLoading = true;
    this.subscriptions.add(
      this.textUtils.getTextById(Number(textId)).subscribe({
        next: (text) => {
          if (text) {
            this.textStateService.setTextToEdit(text);
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      })
    );
  }

  private focusInputIfNeeded(): void {
    if (this.textToEdit && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}