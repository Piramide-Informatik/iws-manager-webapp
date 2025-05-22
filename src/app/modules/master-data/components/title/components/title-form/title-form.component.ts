import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Title } from '../../../../../../Entities/title';
import { TitleService } from '../../../../../../Services/title.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TitleStateService } from '../../utils/title-state.service';
import { TitleUtils } from '../../utils/title-utils';
import { ToggleSwitchStyle } from 'primeng/toggleswitch';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-title-form',
  standalone: false,
  templateUrl: './title-form.component.html',
  styleUrl: './title-form.component.scss',
  providers: [MessageService]
})
export class TitleFormComponent implements OnInit, OnDestroy {

  title!: Title;
  currentTitle: Title | null = null;
  editTitleForm!: FormGroup;
  
  private subscriptions = new Subscription();

   constructor( 
    private titleUtils: TitleUtils, 
    private titleStateService: TitleStateService,
    private messageService: MessageService,
    private translate: TranslateService
    ){ }

  ngOnInit(): void {
    this.initForm();
    this.setupTitleSubscription();
    // this.editTitleForm = new FormGroup({
    //   title: new FormControl('', [Validators.required])
    // });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.editTitleForm = new FormGroup({
      title: new FormControl('', [Validators.required])
    });
  }

  private setupTitleSubscription(): void {
    this.subscriptions.add(
      this.titleStateService.currentTitle$.subscribe(title => {
        this.currentTitle = title;
        if (title){
          this.loadTitleData(title);
        } else {
          this.clearForm();
        }
      })
    )
  }

  private loadTitleData(title: Title): void {
    this.editTitleForm.patchValue({
      title: title.name
    });
  }

  private clearForm(): void {
    this.editTitleForm.reset();
    this.currentTitle = null;
  }

  onSubmit(): void {
    if (this.editTitleForm.invalid || !this.currentTitle) {
      this.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: this.translate.instant('TITLE.ALERT.FORM_INVALID')
      });
      return;
    }

    const updatedTitle: Title = {
      ...this.currentTitle,
      name: this.editTitleForm.value.title
    };

    this.subscriptions.add(
      this.titleUtils.updateTitle(updatedTitle).subscribe({
        next: (title) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: this.translate.instant('TITLE.ALERT.SUCCESS')
          });
          this.clearForm();
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: this.translate.instant('TITLE.ALERT.FAILED')
          });
        }
      })
    );
  }

  private markAllAsTouched(): void {
    Object.values(this.editTitleForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }
}