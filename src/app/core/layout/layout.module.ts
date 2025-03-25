import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { MenuModule } from 'primeng/menu';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { TooltipModule } from 'primeng/tooltip';


@NgModule({
  declarations: [MainLayoutComponent, SidebarComponent, HeaderComponent, MainMenuComponent],
  imports: [
    CommonModule,
    LayoutRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    ButtonModule,
    SidebarModule,
    TooltipModule,
    MenuModule
  ],
  exports:[MainLayoutComponent]
})
export class LayoutModule { }
