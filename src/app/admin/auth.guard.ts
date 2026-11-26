import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminApi } from './admin-api.service';

/** Only signed-in admins get past; everyone else is sent to the sign-in page. */
export const adminAuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  try {
    const session = await inject(AdminApi).session();
    return session.signedIn ? true : router.createUrlTree(['/admin/login']);
  } catch {
    return router.createUrlTree(['/admin/login']);
  }
};
