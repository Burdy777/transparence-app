import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';

import { InputTextFormField } from './input-text-form-field.component';

describe('InputTextFormField', () => {
  let component: InputTextFormField;
  let fixture: ComponentFixture<InputTextFormField>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTextFormField],
    }).compileComponents();

    fixture = TestBed.createComponent(InputTextFormField);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('control', new FormControl(''));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('rend un input par defaut', () => {
    const input = fixture.nativeElement.querySelector('input.rp-val');
    expect(input).toBeTruthy();
    expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
  });

  it('rend un textarea quand multiline est vrai', async () => {
    fixture.componentRef.setInput('multiline', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('textarea.rp-val')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('input.rp-val')).toBeNull();
  });

  it("affiche l'erreur seulement quand le controle est touche et invalide", async () => {
    const control = new FormControl('', Validators.required);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('errorMessage', 'Champ requis');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.field-error')).toBeNull();

    control.markAsTouched();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.field-error')?.textContent).toContain(
      'Champ requis',
    );
  });
});
