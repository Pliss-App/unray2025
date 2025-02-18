import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';
import { TravelGuard } from 'src/app/core/guards/travel.guard';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),    canActivate: [AuthGuard , TravelGuard] }, // Protección de ruta },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule),    canActivate: [AuthGuard]}, // Protección de ruta },
  { path: '', redirectTo: 'home', pathMatch: 'full'},   {
    path: 'travel-route',
    loadChildren: () => import('./pages/travel-route/travel-route.module').then( m => m.TravelRoutePageModule),  canActivate: [AuthGuard]
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'calificar',
    loadChildren: () => import('./pages/calificar/calificar.module').then( m => m.CalificarPageModule)
  }

// Protección de ruta }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingRoutingModule { }
