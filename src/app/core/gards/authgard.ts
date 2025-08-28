import {ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree, CanActivateFn} from '@angular/router';
import { inject } from '@angular/core';
import { createAuthGuard, AuthGuardData } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;

  const requiredRole = route.data['role'];
  if (!requiredRole) {
    return false;
  }

  const hasRequiredRole = (role: string): boolean =>
    Object.values(grantedRoles.realmRoles).some((roles) => roles.includes(role));

  if (authenticated && hasRequiredRole(requiredRole)) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/');
};

const isLoggedIn = async (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated } = authData;

  if (authenticated) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/');
};

const forceLogin = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated } = authData;

  if (authenticated) {
    return true;
  }

  // Force login instead of redirecting
  const keycloak = inject(Keycloak);
  const currentUrl = `${window.location.origin}${state.url}`;
  
  try {
    await keycloak.login({ redirectUri: currentUrl });
    return false; // This won't be reached as login redirects
  } catch (error) {
    console.error('Login failed:', error);
    const router = inject(Router);
    return router.parseUrl('/');
  }
};
export const canActivateAuthRole = createAuthGuard<CanActivateFn>(isAccessAllowed);
export const canActivateLogin = createAuthGuard<CanActivateFn>(isLoggedIn);
export const canActivateForceLogin = createAuthGuard<CanActivateFn>(forceLogin);
