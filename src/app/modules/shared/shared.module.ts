//Angular 
import { NgModule } from '@angular/core';

//Modulos
import { TranslateDirective, TranslateModule, TranslatePipe } from '@ngx-translate/core';

//Components
import { OccErrorModalComponent } from './components/occ-error-modal/occ-error-modal.component';

@NgModule({
  declarations: [
    OccErrorModalComponent
  ],
  imports: [
    TranslateDirective,
    TranslateModule,
    TranslatePipe
  ],
  exports: [
    OccErrorModalComponent
  ]
})
export class SharedModule { }
