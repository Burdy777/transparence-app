---
name: signal-store
description: Patterns pour creer ou modifier des NgRx Signal Stores dans ce projet Angular. A utiliser quand l'utilisateur cree ou modifie un store (@ngrx/signals), demande les conventions de nommage des stores, ou le template standard d'un store de feature.
---

# NgRx Signal Store Patterns
Use this skill when creating or modifying NgRx Signal Stores.
## Standard Store Template
import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { User } from '../models/user.model';
import { UserApiService } from '../services/user-api.service';

interface UsersState {
  users: User[];
  selectedUserId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: UsersState = {
  users: [],
  selectedUserId: null,
  loading: false,
  error: null,
};

export const UsersStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  withComputed(({ users, selectedUserId }) => ({
    totalUsers: computed(() => users().length),

    selectedUser: computed(
      () => users().find((user) => user.id === selectedUserId()) ?? null
    ),
  })),

  withMethods((store, userApi = inject(UserApiService)) => ({
    selectUser(userId: string): void {
      patchState(store, { selectedUserId: userId });
    },

    clearSelection(): void {
      patchState(store, { selectedUserId: null });
    },

    loadUsers: rxMethod<void>(
      pipe(
        tap(() => {
          patchState(store, {
            loading: true,
            error: null,
          });
        }),

        switchMap(() =>
          userApi.getAll().pipe(
            tapResponse({
              next: (users) => {
                patchState(store, {
                  users,
                  loading: false,
                });
              },

              error: (error: Error) => {
                patchState(store, {
                  error: error.message,
                  loading: false,
                });
              },
            })
          )
        )
      )
    ),

    deleteUser: rxMethod<string>(
      pipe(
        switchMap((userId) =>
          userApi.delete(userId).pipe(
            tapResponse({
              next: () => {
                patchState(store, (state) => ({
                  users: state.users.filter((user) => user.id !== userId),
                }));
              },

              error: (error: Error) => {
                patchState(store, {
                  error: error.message,
                });
              },
            })
          )
        )
      )
    ),
  }))
);

## Naming Conventions
- Store file: `<feature>.store.ts`
- Store class: `<Feature>Store`
- Provide at root: `{ providedIn: 'root' }` for app-wide stores
- Provide at component: omit `providedIn` for scoped stores