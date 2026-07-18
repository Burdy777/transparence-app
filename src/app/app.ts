import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Auth } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app.scss',
})
export class App {
  protected auth = inject(Auth);
  private router = inject(Router);

  // Etat d'ouverture du menu lateral (drawer)
  readonly sidenavOpen = signal(false);

  toggleSidenav(): void {
    this.sidenavOpen.update((open) => !open);
  }

  closeSidenav(): void {
    this.sidenavOpen.set(false);
  }

  logout(): void {
    this.closeSidenav();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
