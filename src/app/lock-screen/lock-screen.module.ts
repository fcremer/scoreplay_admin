import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LockScreenPageRoutingModule } from './lock-screen-routing.module';

import { LockScreenPage } from './lock-screen.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LockScreenPageRoutingModule
  ],
  declarations: [LockScreenPage]
})
export class LockScreenPageModule {}
