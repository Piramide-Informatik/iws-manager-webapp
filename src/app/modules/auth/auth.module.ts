import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthPageComponent } from './components/auth-page/auth-page.component';
import { LoginPageComponent } from './components/login-page/login-page.component';
import { LayoutModule } from '../../core/layout/layout.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  declarations: [
    AuthPageComponent,
    LoginPageComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    LayoutModule,
    ReactiveFormsModule,
    CardModule,
    MessageModule,
    ButtonModule,
    TranslateModule,
    PasswordModule,
    InputTextModule
  ]
})
export class AuthModule { }
