import { HttpInterceptorFn } from '@angular/common/http';

export const AUTH_TOKEN_KEY = 'sig_uagrm_jwt';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  if (!token || !req.url.startsWith('/api')) {
    return next(req);
  }
  const cloned = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
  return next(cloned);
};
