import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'scores',
        loadChildren: () => import('../scores/scores.module').then(m => m.ScoresPageModule)
      },
      {
        path: 'player',
        loadChildren: () => import('../player/player.module').then(m => m.PlayerPageModule)
      },
      {
        path: 'pinball',
        loadChildren: () => import('../pinball/pinball.module').then(m => m.PinballPageModule)
      },
      // New Settings Route
      {
        path: 'settings',
        loadChildren: () => import('../settings/settings.module').then(m => m.SettingsPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/scores',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/scores',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsPageRoutingModule {}