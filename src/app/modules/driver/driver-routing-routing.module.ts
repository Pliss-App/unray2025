import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/guards/auth.guard';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./pages/home/home.module').then(m => m.HomePageModule),    canActivate: [AuthGuard] }, // Protección de ruta },
  { path: 'profile', loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule),    canActivate: [AuthGuard]}, // Protección de ruta },
  { path: 'documentacion', loadChildren: () => import('./pages/documentacion/documentacion.module').then(m => m.DocumentacionPageModule),    canActivate: [AuthGuard]}, // Protección de ruta },
  { path: 'recargar', loadChildren: () => import('./pages/recargar-billetera/recargar-billetera.module').then(m => m.RecargarBilleteraPageModule),    canActivate: [AuthGuard]}, // Protección de ruta },
 
  { path: '', redirectTo: 'home', pathMatch: 'full'},   {
    path: 'travel-route',
    loadChildren: () => import('./pages/travel-route/travel-route.module').then( m => m.TravelRoutePageModule),  canActivate: [AuthGuard]
  },  {
    path: 'calificar',
    loadChildren: () => import('./pages/calificar/calificar.module').then( m => m.CalificarPageModule)
  }

// Protección de ruta }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingRoutingModule { }
