import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LockScreenPage } from './lock-screen.page';

const routes: Routes = [
  {
    path: '',
    component: LockScreenPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LockScreenPageRoutingModule {}
