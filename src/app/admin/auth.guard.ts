import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminApi } from './admin-api.service';
import { AdminMedia } from './media.service';

/** Only signed-in admins get past; everyone else is sent to the sign-in page. */
export const adminAuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const media = inject(AdminMedia);
  try {
    const session = await inject(AdminApi).session();
    // The upload limit depends on where the site is deployed, so take it from
    // the server rather than assuming one.
    if (session.maxUploadBytes) media.maxBytes.set(session.maxUploadBytes);
    return session.signedIn ? true : router.createUrlTree(['/admin/login']);
  } catch {
    return router.createUrlTree(['/admin/login']);
  }
};
