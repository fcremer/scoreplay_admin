import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PinballPageRoutingModule } from './pinball-routing.module';

import { PinballPage } from './pinball.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PinballPageRoutingModule
  ],
  declarations: [PinballPage]
})
export class PinballPageModule {}
