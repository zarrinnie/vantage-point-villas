import { Routes } from '@angular/router';
import { PRIVACY_POLICY, TERMS } from './core/data/policies.data';

export const routes: Routes = [
  {
    path: '',
    title: 'Vantage Point Villas — Private Pool Villas in Uluwatu, Bali',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomePage),
  },
  {
    path: 'villas',
    title: 'The Villas — Vantage Point Villas',
    loadComponent: () => import('./pages/villas/villas').then((m) => m.VillasPage),
  },
  {
    path: 'villas/:slug',
    loadComponent: () => import('./pages/villa-detail/villa-detail').then((m) => m.VillaDetailPage),
  },
  {
    path: 'book',
    title: 'Book your stay — Vantage Point Villas',
    loadComponent: () => import('./pages/booking/booking').then((m) => m.BookingPage),
  },
  {
    path: 'gallery',
    title: 'Gallery — Vantage Point Villas',
    loadComponent: () => import('./pages/gallery/gallery').then((m) => m.GalleryPage),
  },
  {
    path: 'services',
    title: 'Services — Vantage Point Villas',
    loadComponent: () => import('./pages/services/services').then((m) => m.ServicesPage),
  },
  {
    path: 'offers',
    title: 'Offers & Packages — Vantage Point Villas',
    loadComponent: () => import('./pages/offers/offers').then((m) => m.OffersPage),
  },
  {
    path: 'about',
    title: 'About — Vantage Point Villas',
    loadComponent: () => import('./pages/about/about').then((m) => m.AboutPage),
  },
  {
    path: 'faq',
    title: 'Frequently asked questions — Vantage Point Villas',
    loadComponent: () => import('./pages/faq/faq').then((m) => m.FaqPage),
  },
  {
    path: 'contact',
    title: 'Contact — Vantage Point Villas',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.ContactPage),
  },
  {
    path: 'privacy',
    title: 'Privacy policy — Vantage Point Villas',
    data: { policy: PRIVACY_POLICY },
    loadComponent: () => import('./pages/policy/policy').then((m) => m.PolicyPage),
  },
  {
    path: 'terms',
    title: 'Terms & conditions — Vantage Point Villas',
    data: { policy: TERMS },
    loadComponent: () => import('./pages/policy/policy').then((m) => m.PolicyPage),
  },
  {
    path: '**',
    title: 'Page not found — Vantage Point Villas',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFoundPage),
  },
];
