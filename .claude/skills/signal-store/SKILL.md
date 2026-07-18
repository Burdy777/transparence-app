# NgRx Signal Store Patterns
Use this skill when creating or modifying NgRx Signal Stores.
## Standard Store Template
[
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
import { UserApiService } from '../services/user-api.service';
import { User } from '../models/user.model';

// --- State Interface ---
interface UsersState {
  users: User[];
  selectedUserId: string | null;
  loading: boolean;
  error: string | null;
}
// --- Initial State ---
const initialState: UsersState = {
  users: [],
  selectedUserId: null,
  loading: false,
  error: null,
};
// --- Signal Store ---
export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  // Derived / computed signals
  withComputed(({ users, selectedUserId }) => ({
    selectedUser: computed(() =>
      users().find((u) => u.id === selectedUserId()) ?? null
    ),
    totalUsers: computed(() => users().length),
    activeUsers: computed(() => users().filter((u) => u.isActive)),
  })),
  // Methods - both sync and async
  withMethods((store, userApi = inject(UserApiService)) => ({
    // Sync state update
    selectUser(userId: string): void {
      patchState(store, { selectedUserId: userId });
    },
    clearSelection(): void {
      patchState(store, { selectedUserId: null });
    },
    // Async - RxJS-powered method
    loadUsers: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() =>
          userApi.getAll().pipe(
            tapResponse({
              next: (users) => patchState(store, { users, loading: false }),
              error: (err: Error) =>
                patchState(store, { error: err.message, loading: false }),
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
              next: () =>
                patchState(store, (state) => ({
                  users: state.users.filter((u) => u.id !== userId),
                })),
              error: (err: Error) => patchState(store, { error: err.message }),
            })
          )
        )
      )
    ),
  }))
);
]
## Naming Conventions
- Store file: `<feature>.store.ts`
- Store class: `<Feature>Store`
- Provide at root: `{ providedIn: 'root' }` for app-wide stores
- Provide at component: omit `providedIn` for scoped stores