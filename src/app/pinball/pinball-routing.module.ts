import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PinballPage } from './pinball.page';

const routes: Routes = [
  {
    path: '',
    component: PinballPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PinballPageRoutingModule {}
