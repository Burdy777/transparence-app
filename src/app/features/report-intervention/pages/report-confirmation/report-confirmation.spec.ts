import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ReportConfirmation } from './report-confirmation';

describe('ReportConfirmation', () => {
  function setup() {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    return TestBed.createComponent(ReportConfirmation);
  }

  it('se cree', () => {
    expect(setup().componentInstance).toBeTruthy();
  });

  it('affiche le message de succes et le lien de retour a l accueil', () => {
    const fixture = setup();
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.confirm-title')?.textContent).toContain('Rapport envoye');
    const link = el.querySelector('a.rp-cta');
    expect(link?.getAttribute('href')).toBe('/accueil');
  });
});
