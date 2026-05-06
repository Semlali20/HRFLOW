/**
 * JwtInterceptor — attaches the Bearer token to every outgoing HTTP request.
 *
 * NOTE: The app currently uses TokenInterceptor which handles both token
 * attachment AND the 401/refresh logic. This file is kept for reference
 * but is NOT registered in app.module.ts providers to avoid double-intercepting.
 */
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authenticationService.getToken();
        if (token && !request.headers.has('Authorization')) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
        }
        return next.handle(request);
    }
}
