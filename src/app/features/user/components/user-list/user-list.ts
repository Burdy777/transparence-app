/*import { Component, inject, OnInit } from '@angular/core';
import { UsersStore } from '../state/users.store';
import { UserCardComponent } from './user-card.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UserCardComponent, NgClass],
  template: `
    <div class="container-fluid py-4">
      <div class="row align-items-center mb-4">
        <div class="col">
          <h2 class="mb-0">
            Users
            <span class="badge bg-primary ms-2">{{ store.totalUsers() }}</span>
          </h2>
        </div>
        <div class="col-auto">
          <span class="text-muted small">
            {{ store.activeUsers().length }} active
          </span>
        </div>
      </div>
      @if (store.loading()) {
        <div class="d-flex justify-content-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      }
      @if (store.error()) {
        <div class="alert alert-danger" role="alert">
          {{ store.error() }}
        </div>
      }
      @if (!store.loading() && !store.error()) {
        <div class="row g-3">
          @for (user of store.users(); track user.id) {
            <div class="col-12 col-md-6 col-xl-4">
              <app-user-card
                [user]="user"
                [selected]="store.selectedUserId() === user.id"
                (select)="store.selectUser($event)"
                (delete)="store.deleteUser($event)"
              />
            </div>
          } @empty {
            <div class="col-12">
              <p class="text-muted text-center py-4">No users found.</p>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class UserListComponent implements OnInit {
  protected store = inject(UsersStore);
  ngOnInit(): void {
    this.store.loadUsers();
  }
}
  */