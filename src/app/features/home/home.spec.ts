import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { AuthStore } from '../../core/state/auth.store';
import { signal } from '@angular/core';

describe('Home', () => {
  function setup(firstName: string | null) {
    const authStoreStub = {
      user: signal(
        firstName
          ? { id: '1', email: 'a@b.c', firstName, lastName: 'Dupont', roles: ['USER'] }
          : null,
      ),
      logout: () => ({ subscribe: (cb: () => void) => cb() }),
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthStore, useValue: authStoreStub }],
    });
    return TestBed.createComponent(Home).componentInstance;
  }

  it('expose le prenom de l utilisateur connecte', () => {
    expect(setup('Jean').agentName()).toBe('Jean');
  });

  it('retombe sur un libelle neutre sans utilisateur', () => {
    expect(setup(null).agentName()).toBe('Agent');
  });
});
