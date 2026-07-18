import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { Auth } from '../../core/services/auth';
import { signal } from '@angular/core';

describe('Home', () => {
  function setup(agentName: string | null) {
    const authStub = {
      currentAgent: signal(agentName ? { id: '1', email: 'a@b.c', name: agentName } : null),
      logout: () => undefined,
    };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Auth, useValue: authStub }],
    });
    return TestBed.createComponent(Home).componentInstance;
  }

  it('expose le nom de l agent connecte', () => {
    expect(setup('Jean Dupont').agentName()).toBe('Jean Dupont');
  });

  it('retombe sur un libelle neutre sans agent', () => {
    expect(setup(null).agentName()).toBe('Agent');
  });
});
