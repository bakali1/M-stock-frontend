import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BatchService } from './batch.service';
import { ApiService } from './api.service';
import { Batch } from '../models/batch.model';
import { of, firstValueFrom } from 'rxjs';

describe('BatchService - Quarantine Method', () => {
  let service: BatchService;
  let apiService: any;

  const mockBatch: Batch = {
    id: 1,
    lotNumber: 'LOT-2024-001',
    quantity: 100,
    expirationDate: '2025-06-30T00:00:00',
    location: 'A-1-1',
    status: 'QUARANTINE',
    productId: 1,
    productName: 'Saline Solution',
    nsnCode: 'NSN-001',
    daysUntilExpiration: 400,
    expirationAlertLevel: 'NORMAL',
    version: 1
  };

  beforeEach(() => {
    const apiServiceMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        BatchService,
        { provide: ApiService, useValue: apiServiceMock }
      ]
    });

    service = TestBed.inject(BatchService);
    apiService = apiServiceMock;
  });

  describe('quarantine method', () => {
    it('should make PUT request to correct endpoint', () => {
      const batchId = 1;
      const reason = 'Found contamination';
      const encodedReason = encodeURIComponent(reason);

      apiService.put.mockReturnValue(of({ data: mockBatch }));

      service.quarantine(batchId, reason).subscribe();

      expect(apiService.put).toHaveBeenCalledWith(
        `/batches/${batchId}/quarantine?reason=${encodedReason}`,
        {}
      );
    });

    it('should encode reason parameter correctly', () => {
      const batchId = 1;
      const reason = 'Found contamination with special chars: &=?#';
      const encodedReason = encodeURIComponent(reason);

      apiService.put.mockReturnValue(of({ data: mockBatch }));

      service.quarantine(batchId, reason).subscribe();

      expect(apiService.put).toHaveBeenCalledWith(
        `/batches/${batchId}/quarantine?reason=${encodedReason}`,
        {}
      );
    });

    it('should return batch with QUARANTINE status', async () => {
      apiService.put.mockReturnValue(of({ data: mockBatch }));
      const result = await firstValueFrom(service.quarantine(1, 'Contamination'));
      expect(result.status).toBe('QUARANTINE');
      expect(result.id).toBe(1);
    });

    it('should extract data from response', async () => {
      apiService.put.mockReturnValue(of({ data: mockBatch }));
      const result = await firstValueFrom(service.quarantine(1, 'Contamination'));
      expect(result).toEqual(mockBatch);
    });

    it('should handle multiple calls with different batch IDs', () => {
      apiService.put.mockReturnValue(of({ data: mockBatch }));

      service.quarantine(1, 'Reason 1').subscribe();
      service.quarantine(2, 'Reason 2').subscribe();

      expect(apiService.put).toHaveBeenCalledWith(
        '/batches/1/quarantine?reason=' + encodeURIComponent('Reason 1'),
        {}
      );
      expect(apiService.put).toHaveBeenCalledWith(
        '/batches/2/quarantine?reason=' + encodeURIComponent('Reason 2'),
        {}
      );
    });

    it('should handle empty reason string', () => {
      apiService.put.mockReturnValue(of({ data: mockBatch }));

      service.quarantine(1, '').subscribe();

      expect(apiService.put).toHaveBeenCalledWith(
        '/batches/1/quarantine?reason=',
        {}
      );
    });

    it('should handle very long reason strings', () => {
      const longReason = 'a'.repeat(1000);
      const encodedReason = encodeURIComponent(longReason);

      apiService.put.mockReturnValue(of({ data: mockBatch }));

      service.quarantine(1, longReason).subscribe();

      expect(apiService.put).toHaveBeenCalledWith(
        `/batches/1/quarantine?reason=${encodedReason}`,
        {}
      );
    });

    it('should pass empty body in PUT request', () => {
      apiService.put.mockReturnValue(of({ data: mockBatch }));

      service.quarantine(1, 'Reason').subscribe();

      // Verify empty body is passed
      const calls = apiService.put.mock.calls;
      expect(calls[calls.length - 1][1]).toEqual({});
    });
  });

  describe('Other methods (existing functionality)', () => {
    it('should search batches', async () => {
      const mockBatches = [mockBatch];
      apiService.get.mockReturnValue(of({ data: mockBatches }));
      const result = await firstValueFrom(service.search('test'));
      expect(result).toEqual(mockBatches);
      expect(apiService.get).toHaveBeenCalledWith('/batches/search?key=test');
    });

    it('should get batch by ID', async () => {
      apiService.get.mockReturnValue(of({ data: mockBatch }));
      const result = await firstValueFrom(service.getById(1));
      expect(result).toEqual(mockBatch);
      expect(apiService.get).toHaveBeenCalledWith('/batches/1');
    });

    it('should get alerts', async () => {
      const mockBatches = [mockBatch];
      apiService.get.mockReturnValue(of({ data: mockBatches }));
      const result = await firstValueFrom(service.getAlerts(30));
      expect(result).toEqual(mockBatches);
      expect(apiService.get).toHaveBeenCalledWith('/batches/alerts/30');
    });

    it('should create batch', async () => {
      apiService.post.mockReturnValue(of({ data: mockBatch }));
      const result = await firstValueFrom(service.create({ lotNumber: 'LOT-2024-001' }));
      expect(result).toEqual(mockBatch);
      expect(apiService.post).toHaveBeenCalledWith('/batches', { lotNumber: 'LOT-2024-001' });
    });

    it('should update batch', async () => {
      apiService.put.mockReturnValue(of({ data: mockBatch }));
      const result = await firstValueFrom(service.update({ id: 1, status: 'QUARANTINE' }));
      expect(result).toEqual(mockBatch);
      expect(apiService.put).toHaveBeenCalledWith('/batches', { id: 1, status: 'QUARANTINE' });
    });
  });
});
