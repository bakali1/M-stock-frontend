import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BatchDetailPageComponent } from './batch-detail-page.component';
import { BatchService } from '../../services/batch.service';
import { ToastService } from '../../services/toast.service';
import { QuarantineService } from '../../services/quarantine.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Batch } from '../../models/batch.model';

describe('BatchDetailPageComponent', () => {
  let component: BatchDetailPageComponent;
  let fixture: ComponentFixture<BatchDetailPageComponent>;
  let batchService: any;
  let toastService: any;
  let router: any;

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
    const batchServiceMock = {
      getById: vi.fn().mockReturnValue(of(mockBatch)),
      quarantine: vi.fn()
    };
    const toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };
    const routerMock = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [BatchDetailPageComponent],
      providers: [
        { provide: BatchService, useValue: batchServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        QuarantineService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '1'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BatchDetailPageComponent);
    component = fixture.componentInstance;
    batchService = batchServiceMock;
    toastService = toastServiceMock;
    router = routerMock;
  });

  describe('Loading and Display', () => {
    it('should load batch on init', async () => {
      fixture.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(batchService.getById).toHaveBeenCalledWith(1);
      expect(component.batch()?.lotNumber).toBe('LOT-2024-001');
    });

    it('should set loading to true initially and false after loading', async () => {
      expect(component.loading()).toBe(false);
      
      fixture.detectChanges();
      
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(component.loading()).toBe(false);
    });

    it('should handle error when loading batch', async () => {
      batchService.getById.mockReturnValue(throwError(() => new Error('Network error')));

      fixture.detectChanges();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(component.loading()).toBe(false);
      expect(toastService.error).toHaveBeenCalledWith('Failed to load batch');
    });
  });

  describe('Navigation', () => {
    it('should navigate back to /batches', () => {
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(['/batches']);
    });
  });
});
