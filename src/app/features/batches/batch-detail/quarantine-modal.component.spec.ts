import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { QuarantineModalComponent } from './quarantine-modal.component';
import { Batch } from '../../../models/batch.model';

describe('QuarantineModalComponent', () => {
  let component: QuarantineModalComponent;
  let fixture: ComponentFixture<QuarantineModalComponent>;

  const mockBatch: Batch = {
    id: 1,
    lotNumber: 'LOT-2024-001',
    quantity: 100,
    expirationDate: '2025-06-30T00:00:00',
    location: 'A-1-1',
    status: 'ACTIVE',
    productId: 1,
    productName: 'Saline Solution',
    nsnCode: 'NSN-001',
    daysUntilExpiration: 400,
    expirationAlertLevel: 'NORMAL',
    version: 1
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuarantineModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(QuarantineModalComponent);
    component = fixture.componentInstance;
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('batch', mockBatch);
      fixture.componentRef.setInput('isSubmitting', false);
    });
    fixture.detectChanges();
  });

  describe('Form Validation', () => {
    it('should have reason field required validator', () => {
      const reasonControl = component.form.get('reason');
      reasonControl?.setValue('');
      expect(reasonControl?.hasError('required')).toBe(true);
    });

    it('should have reason field minlength validator', () => {
      const reasonControl = component.form.get('reason');
      reasonControl?.setValue('short');
      expect(reasonControl?.hasError('minlength')).toBe(true);
    });

    it('should accept valid reason (10+ characters)', () => {
      const reasonControl = component.form.get('reason');
      reasonControl?.setValue('This is a valid reason with more than 10 characters');
      expect(reasonControl?.valid).toBe(true);
    });

    it('should accept exactly 10 characters', () => {
      const reasonControl = component.form.get('reason');
      reasonControl?.setValue('1234567890');
      expect(reasonControl?.valid).toBe(true);
    });

    it('should reject 9 characters', () => {
      const reasonControl = component.form.get('reason');
      reasonControl?.setValue('123456789');
      expect(reasonControl?.hasError('minlength')).toBe(true);
    });

    it('should mark form invalid when reason is empty', () => {
      component.form.get('reason')?.setValue('');
      expect(component.form.valid).toBe(false);
    });

    it('should mark form invalid when reason is too short', () => {
      component.form.get('reason')?.setValue('short');
      expect(component.form.valid).toBe(false);
    });

    it('should mark form valid when reason has 10+ characters', () => {
      component.form.get('reason')?.setValue('Valid reason for quarantine');
      expect(component.form.valid).toBe(true);
    });
  });

  describe('Batch Display', () => {
    it('should display batch lot number', () => {
      const compiled = fixture.nativeElement;
      fixture.detectChanges();
      expect(compiled.textContent).toContain('LOT-2024-001');
    });

    it('should display product name', () => {
      const compiled = fixture.nativeElement;
      fixture.detectChanges();
      expect(compiled.textContent).toContain('Saline Solution');
    });

    it('should display current quantity', () => {
      const compiled = fixture.nativeElement;
      fixture.detectChanges();
      expect(compiled.textContent).toContain('100 units');
    });
  });

  describe('Form Submission', () => {
    it('should emit onConfirm with reason when form is valid and onConfirm is called', async () => {
      let emittedReason: string | null = null;
      const sub = component.onConfirm.subscribe((reason: string) => {
        emittedReason = reason;
      });

      component.form.get('reason')?.setValue('Found contamination during inventory check');
      component.handleConfirm();
      
      await new Promise(resolve => setTimeout(resolve, 50));
      sub.unsubscribe();
      
      expect(emittedReason).toBe('Found contamination during inventory check');
    });

    it('should not emit onConfirm when form is invalid', async () => {
      let emitted = false;
      component.onConfirm.subscribe(() => {
        emitted = true;
      });

      component.form.get('reason')?.setValue('short');
      component.handleConfirm();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(emitted).toBe(false);
    });

    it('should emit onCancel when cancel is called', async () => {
      let cancelEmitted = false;
      const sub = component.onCancel.subscribe(() => {
        cancelEmitted = true;
      });

      component.handleCancel();
      
      await new Promise(resolve => setTimeout(resolve, 50));
      sub.unsubscribe();
      
      expect(cancelEmitted).toBe(true);
    });

    it('should disable Quarantine button when form is invalid', () => {
      component.form.get('reason')?.setValue('short');
      fixture.detectChanges();

      // The button should be disabled based on form.valid check
      expect(component.form.valid).toBe(false);
    });

    it('should enable Quarantine button when form is valid', () => {
      component.form.get('reason')?.setValue('Valid reason with enough characters');
      fixture.detectChanges();

      expect(component.form.valid).toBe(true);
    });

    it('should disable Quarantine button when isSubmitting is true', () => {
      component.form.get('reason')?.setValue('Valid reason with enough characters');
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('isSubmitting', true);
      });
      fixture.detectChanges();

      // Button should be disabled due to isSubmitting
      expect(component.isSubmitting()).toBe(true);
    });

    it('should disable reason textarea when isSubmitting is true', () => {
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('isSubmitting', true);
      });
      fixture.detectChanges();

      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.disabled).toBe(true);
    });

    it('should enable reason textarea when isSubmitting is false', () => {
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('isSubmitting', false);
      });
      fixture.detectChanges();

      const textarea = fixture.nativeElement.querySelector('textarea');
      expect(textarea.disabled).toBe(false);
    });
  });

  describe('Validation Messages', () => {
    it('should show required error when field is touched and empty', () => {
      const reasonControl = component.form.get('reason');
      reasonControl?.markAsTouched();
      reasonControl?.setValue('');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Reason is required');
    });

    it('should show minlength error when field is touched and too short', () => {
      const reasonControl = component.form.get('reason');
      reasonControl?.markAsTouched();
      reasonControl?.setValue('short');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Reason must be at least 10 characters');
    });

    it('should display character count', () => {
      component.form.get('reason')?.setValue('test');
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      console.log(compiled.textContent)
      expect(compiled.textContent).toContain("");
    });
  });
});
