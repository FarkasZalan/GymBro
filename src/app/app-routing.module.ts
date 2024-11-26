import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotFoundComponent } from './not-found/not-found.component';
import { AuthGuard } from './auth/auth-guard.service';
import { AdminGuard } from './admin-profile/admin-guard.service';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/pages.module')
      .then(m => m.PagesModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module')
      .then(m => m.AuthModule), // Ensures only authenticated users can access this route
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module')
      .then(m => m.ProfileModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'product',
    loadChildren: () => import('./products/product.module')
      .then(m => m.ProductModule),
  },
  {
    path: 'receipt',
    loadChildren: () => import('./receipt/receipt.module')
      .then(m => m.ReceiptModule),
  },
  {
    path: 'blog',
    loadChildren: () => import('./user-blog-list/blog.module')
      .then(m => m.BlogModule),
  },
  {
    path: 'cart',
    loadChildren: () => import('./cart/cart.module')
      .then(m => m.CartModule),
  },
  {
    path: 'checkout',
    loadChildren: () => import('./payment/payment.module')
      .then(m => m.PaymentModule)
  },
  {
    path: 'admin-profile',
    loadChildren: () => import('./admin-profile/admin-profile.module')
      .then(m => m.AdminProfileModule),
    canActivate: [AdminGuard],
  },
  { path: '', redirectTo: 'pages', pathMatch: 'full' },

  // Catch-all route for undefined paths, shows NotFoundComponent
  {
    path: '**',
    component: NotFoundComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)], // Configures the router with the defined routes
  exports: [RouterModule], // Exports RouterModule to make it available in the application
})
export class AppRoutingModule {
}
