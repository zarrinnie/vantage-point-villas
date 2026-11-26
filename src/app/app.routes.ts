import { Routes } from '@angular/router';

/*
 * Page titles and descriptions are set by each page through SeoService, from
 * the SEO fields in Admin → Page text, so the routes carry no static `title`.
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'villas',
    loadComponent: () => import('./pages/villas/villas').then((m) => m.VillasPage),
  },
  {
    path: 'villas/:slug',
    loadComponent: () => import('./pages/villa-detail/villa-detail').then((m) => m.VillaDetailPage),
  },
  {
    path: 'book',
    loadComponent: () => import('./pages/booking/booking').then((m) => m.BookingPage),
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery').then((m) => m.GalleryPage),
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services/services').then((m) => m.ServicesPage),
  },
  {
    path: 'offers',
    loadComponent: () => import('./pages/offers/offers').then((m) => m.OffersPage),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.AboutPage),
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq').then((m) => m.FaqPage),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.ContactPage),
  },
  {
    path: 'privacy',
    data: { policy: 'privacy' },
    loadComponent: () => import('./pages/policy/policy').then((m) => m.PolicyPage),
  },
  {
    path: 'terms',
    data: { policy: 'terms' },
    loadComponent: () => import('./pages/policy/policy').then((m) => m.PolicyPage),
  },
  {
    path: 'admin',
    title: 'Admin — Vantage Point Villas',
    loadChildren: () => import('./admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPage),
  },
];
