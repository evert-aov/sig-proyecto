import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AUTH_TOKEN_KEY } from '../api/auth.interceptor';
import { SigApiService } from '../api/sig-api.service';
import { AuthUsuario } from '../models/sig.models';

@Injectable({ providedIn: 'root' })
export class AuthStateFacade {
  private readonly api = inject(SigApiService);

  readonly usuario = signal<AuthUsuario | null>(null);
  readonly error = signal<string | null>(null);
  readonly autenticado = signal(Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));

  async restaurarSesion(): Promise<void> {
    if (!localStorage.getItem(AUTH_TOKEN_KEY)) {
      this.autenticado.set(false);
      this.usuario.set(null);
      return;
    }
    try {
      const perfil = await firstValueFrom(this.api.obtenerPerfil());
      this.usuario.set(perfil);
      this.autenticado.set(true);
    } catch {
      this.logout();
    }
  }

  async login(correo: string, password: string): Promise<boolean> {
    this.error.set(null);
    try {
      const res = await firstValueFrom(this.api.login(correo, password));
      localStorage.setItem(AUTH_TOKEN_KEY, res.accessToken);
      this.usuario.set(res.usuario);
      this.autenticado.set(true);
      return true;
    } catch {
      this.error.set('Correo o contraseña incorrectos.');
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    this.usuario.set(null);
    this.autenticado.set(false);
  }
}
