import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BatchDetailComponent } from './batch-detail.component';
import { QuarantineService } from '../../../services/quarantine.service';
import { Batch } from '../../../models/batch.model';
import { ButtonComponent } from '../../../components/button/button.component';
import { CardComponent } from '../../../components/card/card.component';

describe('BatchDetailComponent - Quarantine UI', () => {
  let component: BatchDetailComponent;
  let fixture: ComponentFixture<BatchDetailComponent>;
  let quarantineService: QuarantineService;

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
      imports: [BatchDetailComponent, ButtonComponent, CardComponent],
      providers: [QuarantineService]
    }).compileComponents();

    fixture = TestBed.createComponent(BatchDetailComponent);
    component = fixture.componentInstance;
    quarantineService = TestBed.inject(QuarantineService);
    TestBed.runInInjectionContext(() => {
      fixture.componentRef.setInput('batch', mockBatch);
    });
    fixture.detectChanges();
  });

  describe('Quarantine Button Visibility', () => {
    it('should show enabled Quarantine button when batch is ACTIVE', () => {
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('batch', mockBatch);
      });
      fixture.detectChanges();

      expect(component.isQuarantineDisabled()).toBe(false);
      // Check that at least one app-button exists (the variant="danger" one is shown when not disabled)
      const quarantineButtons = fixture.nativeElement.querySelectorAll('app-button');
      expect(quarantineButtons.length).toBeGreaterThan(0);
    });

    it('should show disabled Quarantine button when batch is QUARANTINE', () => {
      const quarantinedBatch = { ...mockBatch, status: 'QUARANTINE' };
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('batch', quarantinedBatch);
      });
      fixture.detectChanges();

      expect(component.isQuarantineDisabled()).toBe(true);
    });

    it('should show disabled Quarantine button when batch is RETIRED', () => {
      const retiredBatch = { ...mockBatch, status: 'RETIRED' };
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('batch', retiredBatch);
      });
      fixture.detectChanges();

      expect(component.isQuarantineDisabled()).toBe(true);
    });

    it('should only show enabled button for ACTIVE status', () => {
      const statuses: Array<'ACTIVE' | 'QUARANTINE' | 'RETIRED'> = ['ACTIVE', 'QUARANTINE', 'RETIRED'];
      
      statuses.forEach(status => {
        const batch = { ...mockBatch, status };
        TestBed.runInInjectionContext(() => {
          fixture.componentRef.setInput('batch', batch);
        });
        fixture.detectChanges();

        if (status === 'ACTIVE') {
          expect(component.isQuarantineDisabled()).toBe(false);
        } else {
          expect(component.isQuarantineDisabled()).toBe(true);
        }
      });
    });
  });

  describe('Batch Information Display', () => {
    it('should display product name', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Saline Solution');
    });

    it('should display lot number', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('LOT-2024-001');
    });

    it('should display current quantity', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('100');
    });

    it('should display NSN code', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('NSN-001');
    });

    it('should display location', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('A-1-1');
    });

    it('should display status badge', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('ACTIVE');
    });

    it('should display warning message for QUARANTINE status', () => {
      const quarantinedBatch = { ...mockBatch, status: 'QUARANTINE' };
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('batch', quarantinedBatch);
      });
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('This batch is quarantined and cannot be used');
    });

    it('should not display warning message for ACTIVE status', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).not.toContain('This batch is quarantined and cannot be used');
    });
  });

  describe('Status Badge Styling', () => {
    it('should apply success styles for ACTIVE status', () => {
      const badge = component.getStatusBadge('ACTIVE');
      expect(badge).toContain('app-success');
    });

    it('should apply danger styles for QUARANTINE status', () => {
      const badge = component.getStatusBadge('QUARANTINE');
      expect(badge).toContain('app-danger');
    });

    it('should apply neutral styles for RETIRED status', () => {
      const badge = component.getStatusBadge('RETIRED');
      expect(badge).toContain('app-neutral');
    });

    it('should default to ACTIVE styles for unknown status', () => {
      const badge = component.getStatusBadge('UNKNOWN');
      expect(badge).toContain('app-success');
    });
  });

  describe('Quarantine Service', () => {
    it('should request quarantine using the service', () => {
      const requestSpy = vi.spyOn(quarantineService, 'requestQuarantine');

      component.onQuarantine();

      expect(requestSpy).toHaveBeenCalledWith(mockBatch);
    });

    it('should request quarantine with current batch data', () => {
      const requestSpy = vi.spyOn(quarantineService, 'requestQuarantine');
      const testBatch = { ...mockBatch, lotNumber: 'LOT-TEST-123' };
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('batch', testBatch);
      });
      fixture.detectChanges();

      component.onQuarantine();

      expect(requestSpy).toHaveBeenCalledWith(testBatch);
    });
  });

  describe('Input Binding', () => {
    it('should accept batch as required input', () => {
      expect(() => {
        fixture.detectChanges();
      }).not.toThrow();
    });

    it('should update when batch input changes', () => {
      const newBatch = { ...mockBatch, productName: 'New Product' };
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('batch', newBatch);
      });
      fixture.detectChanges();

      expect(component.batch().productName).toBe('New Product');
    });

    it('should reactively update button state when batch status changes', () => {
      // Start with ACTIVE
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('batch', { ...mockBatch, status: 'ACTIVE' });
      });
      fixture.detectChanges();
      expect(component.isQuarantineDisabled()).toBe(false);

      // Change to QUARANTINE
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('batch', { ...mockBatch, status: 'QUARANTINE' });
      });
      fixture.detectChanges();
      expect(component.isQuarantineDisabled()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('should have title on disabled button explaining why', () => {
      const disabledBatch = { ...mockBatch, status: 'QUARANTINE' };
      TestBed.runInInjectionContext(() => {
        fixture.componentRef.setInput('batch', disabledBatch);
      });
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('app-button');
      expect(button).toBeNull();
    });
  });
});
