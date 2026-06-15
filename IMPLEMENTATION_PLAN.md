# M-STOCK IMPLEMENTATION PLAN
## Complete Developer Guide - Phase 1 & 2

**Document Date**: 2026-05-22  
**Status**: READY FOR SPRINT  
**Target MVP Launch**: Week 3 (21 dev-days @ 8h/day)

---

## 📊 EXECUTIVE SUMMARY

### Project Status

```
┌─────────────────────────────────────────────────────────┐
│ M-STOCK INVENTORY MANAGEMENT SYSTEM - STATUS OVERVIEW   │
├─────────────────────────────────────────────────────────┤
│ Backend API        │ ████████████████████ │ 100% (38 endpoints) │
│ Database Schema    │ ████████████████████ │ 100% (5 tables)     │
│ Frontend UI        │ ██████████░░░░░░░░░░ │  72% (19/26 pages)  │
│ Integration        │ ████████████░░░░░░░░ │  72% (27/38 mapped) │
│                                                                   │
│ Ready for MVP:     ✅ YES (6 critical tasks remain)               │
│ Can ship Week 3:   ✅ YES (54 dev-hours = 2.7 weeks)             │
│ Compliance ready:  ⚠️  Partial (audit logs needed Phase 2)       │
└─────────────────────────────────────────────────────────┘
```

### Critical Path to MVP

```
WEEK 1 (Auth + UX Polish)
  Day 1-2: T1.1 (User Profile) + T1.5 (UI States) [PARALLEL]
  Day 3-4: T1.2 (Batch Quarantine) + T1.6 (Auth) [PARALLEL]
  Day 5:   T1.3 (Error Handling) + T1.4 (Pagination)

WEEK 2 (Integration & Testing)
  Day 6-7: Complete remaining tasks, fix bugs
  Day 8-9: End-to-end testing, performance tuning
  Day 10:  Deploy staging, UAT handoff

WEEK 3 (UAT & Launch)
  Days 11-15: Hospital user testing, fixes, documentation
  Day 15:  🚀 Production launch
```

---

## 🎯 PHASE 1: CRITICAL TASKS (MVP Completion)

### Task Overview

| Task | Title | Effort | Priority | Owner | Week |
|------|-------|--------|----------|-------|------|
| **T1.1** | User Profile Save | 8h | CRITICAL | Frontend Dev 1 | W1 |
| **T1.2** | Batch Quarantine UI | 10h | CRITICAL | Frontend Dev 1 | W1 |
| **T1.3** | Txn Error Handling | 9h | HIGH | Frontend Dev 2 | W1 |
| **T1.4** | Batch Pagination | 8h | HIGH | Frontend Dev 2 | W1 |
| **T1.5** | Loading/Empty States | 6h | MEDIUM | Frontend Dev 3 | W1 |
| **T1.6** | Auth Interceptor | 7h | HIGH | Frontend Dev 3 | W1 |
| | **TOTAL** | **54h** | | | **W1-2** |

---

## 📝 DETAILED TASK SPECIFICATIONS

### TASK 1.1: User Profile Save

**User Story:**  
> As a **healthcare worker**, I want to **update my profile information** so that **my account reflects my current contact details and preferences**.

**Priority:** CRITICAL ⚠️  
**Effort Estimate:**
- Design/Specs: 1h
- Development: 5h
- Testing: 2h
- Total: 8h

---

#### **Acceptance Criteria**

- [ ] User can load profile page and see current account info (username, email, role)
- [ ] User can modify email and password fields
- [ ] Form shows validation errors for invalid email (must be valid RFC 5322)
- [ ] Form shows validation errors for weak passwords (min 8 chars, uppercase, number, special char)
- [ ] User clicks "Save Profile" button
- [ ] API call made: `PUT /api/v0/users` with updated user object
- [ ] Loading spinner shows during API call
- [ ] On success: Toast shows "Profile updated successfully"
- [ ] Current user signal refreshed, UI updates immediately
- [ ] On error (e.g., 409 Conflict): Toast shows error message from server
- [ ] "Save" button disabled during submission (prevent double-submit)
- [ ] Back-end validation enforces same rules

---

#### **Technical Implementation**

**Files to Modify:**

1. **`/frontend/src/app/services/auth.service.ts`**
   ```typescript
   // Add method:
   updateCurrentUser(updates: Partial<User>): Observable<User> {
     return this.http.put<User>(`${this.apiUrl}/users`, updates).pipe(
       tap(user => {
         this.currentUserSignal.set(user);
         localStorage.setItem('current_user', JSON.stringify(user));
       }),
       catchError(this.handleError)
     );
   }
   ```

2. **`/frontend/src/app/features/user/user-account/user-account.ts`**
   ```typescript
   export class UserAccountComponent {
     authService = inject(AuthService);
     toastService = inject(ToastService);
     formBuilder = inject(FormBuilder);
     
     profileForm = this.formBuilder.group({
       email: ['', [Validators.required, Validators.email]],
       password: ['', [Validators.minLength(8), this.passwordValidator()]]
     });
     
     isSaving = signal(false);
     currentUser = this.authService.currentUserSignal;
     
     ngOnInit() {
       this.profileForm.patchValue({
         email: this.currentUser().email
       });
     }
     
     onSaveProfile() {
       if (!this.profileForm.valid) {
         this.toastService.error('Please fix form errors');
         return;
       }
       
       this.isSaving.set(true);
       this.authService.updateCurrentUser(this.profileForm.value)
         .pipe(
           finalize(() => this.isSaving.set(false))
         )
         .subscribe({
           next: (user) => {
             this.toastService.success('Profile updated successfully');
           },
           error: (err) => {
             this.toastService.error(err.error?.msg || 'Failed to update profile');
           }
         });
     }
   }
   ```

**Backend Endpoint (Verify):**

```bash
# Test endpoint before frontend work
curl -X PUT http://localhost:8080/api/v0/users \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"email":"newemail@hospital.local","role":"PHARMACIAN"}'

# Expected response (200):
{
  "id": 1,
  "username": "pharmacist_1",
  "email": "newemail@hospital.local",
  "role": "PHARMACIAN",
  "active": true
}
```

**API Contract:**

| Aspect | Details |
|--------|---------|
| **URL** | `PUT /api/v0/users` |
| **Auth** | Required (Bearer token) |
| **Request Body** | `{ email?: string, password?: string, role?: string }` |
| **Response (200)** | `{ id, username, email, role, active }` |
| **Response (400)** | `{ error: "Invalid email format" }` |
| **Response (409)** | `{ error: "Email already in use" }` |
| **Response (401)** | `{ error: "Unauthorized" }` |

---

#### **Testing Strategy**

**Unit Tests** (Jasmine/Karma):
```typescript
describe('UserAccountComponent', () => {
  let component: UserAccountComponent;
  let fixture: ComponentFixture<UserAccountComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['updateCurrentUser']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    
    await TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserAccountComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('should call updateCurrentUser with form data on save', () => {
    const updatedUser = { email: 'new@hospital.local' };
    authService.updateCurrentUser.and.returnValue(of(updatedUser));
    
    component.profileForm.patchValue(updatedUser);
    component.onSaveProfile();

    expect(authService.updateCurrentUser).toHaveBeenCalledWith(updatedUser);
  });

  it('should show success toast on successful update', (done) => {
    authService.updateCurrentUser.and.returnValue(of({}));
    component.onSaveProfile();

    setTimeout(() => {
      expect(toastService.success).toHaveBeenCalled();
      done();
    }, 100);
  });

  it('should show error toast on failed update', (done) => {
    const error = { error: { msg: 'Email already in use' } };
    authService.updateCurrentUser.and.returnValue(throwError(() => error));
    component.onSaveProfile();

    setTimeout(() => {
      expect(toastService.error).toHaveBeenCalled();
      done();
    }, 100);
  });
});
```

**Integration Test:**
```bash
# 1. Login as test user
curl -X POST http://localhost:8080/api/v0/auth/login \
  -d '{"username":"pharmacist_1","password":"password123"}'

# 2. Get token from response
TOKEN="eyJhbGc..."

# 3. Update profile
curl -X PUT http://localhost:8080/api/v0/users \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"email":"updated@hospital.local"}'

# 4. Verify update
curl -X GET http://localhost:8080/api/v0/auth/currentuser \
  -H "Authorization: Bearer $TOKEN"

# Expected: email field shows updated value
```

**Manual QA Steps:**
1. Log in as pharmacist_1
2. Navigate to /account
3. Change email to "newemail@hospital.local"
4. Click "Save Profile"
5. Verify: Toast shows success message
6. Verify: Page title or header shows updated email
7. Refresh page
8. Verify: Email still shows updated value (persisted)
9. Try invalid email "not-an-email"
10. Verify: Form shows validation error, Save button disabled

---

#### **Error Handling**

| Scenario | HTTP Code | Response | Frontend Action |
|----------|-----------|----------|-----------------|
| Valid update | 200 | User object | Show success toast, update signal |
| Invalid email | 400 | `{error: "Invalid email"}` | Show error toast, keep form data |
| Email taken | 409 | `{error: "Email already..."}` | Show error toast, keep form data |
| Password too weak | 400 | `{error: "Password must..."}` | Show validation error inline |
| Token expired | 401 | `{error: "Unauthorized"}` | Redirect to login, show toast |
| Server error | 500 | `{error: "..."}` | Show generic error, offer retry |

---

#### **Definition of Done**

- [ ] Code compiles without warnings
- [ ] All acceptance criteria met
- [ ] Unit tests written and passing (>80% coverage)
- [ ] Integration test passes (end-to-end with real backend)
- [ ] Manual QA sign-off (no bugs found)
- [ ] Code reviewed (2 approvals)
- [ ] Commit message follows format: `feat(auth): allow users to update profile #T1.1`
- [ ] No console errors or warnings
- [ ] Accessibility check: Form labels present, focus states visible
- [ ] Documentation: Code comments for complex logic, README updated

---

---

### TASK 1.2: Batch Quarantine UI

**User Story:**  
> As a **pharmacy manager**, I want to **quarantine a batch** so that **it cannot be used in stock movements until it's released**.

**Priority:** CRITICAL ⚠️  
**Effort Estimate:**
- Design/Specs: 1.5h
- Development: 6h
- Testing: 2.5h
- Total: 10h

---

#### **Acceptance Criteria**

- [ ] User navigates to batch detail page
- [ ] "Quarantine" button visible when batch status is ACTIVE
- [ ] "Quarantine" button hidden when batch status is QUARANTINE or RETIRED
- [ ] User clicks "Quarantine" button
- [ ] Modal dialog appears with title "Quarantine Batch"
- [ ] Modal shows batch info: Lot Number, Product Name, Current Quantity
- [ ] Modal has text area for "Reason for Quarantine"
- [ ] Modal has "Cancel" and "Quarantine" buttons
- [ ] User enters reason (required, min 10 chars) and clicks "Quarantine"
- [ ] API call made: `PUT /api/v0/batches/{id}/quarantine?reason=...`
- [ ] Loading spinner shows during API call
- [ ] On success: Batch status changes to QUARANTINE (badge color changes to yellow)
- [ ] Toast shows "Batch quarantined successfully"
- [ ] Modal closes automatically
- [ ] On error: Modal stays open, error shown in toast, user can retry
- [ ] Reason is logged in audit trail

---

#### **Technical Implementation**

**Files to Modify:**

1. **`/frontend/src/app/services/batch.service.ts`**
   ```typescript
   quarantine(batchId: number, reason: string): Observable<Batch> {
     const params = new HttpParams().set('reason', reason);
     return this.http.put<Batch>(
       `${this.apiUrl}/batches/${batchId}/quarantine`,
       null,
       { params }
     ).pipe(
       catchError(error => {
         console.error('Quarantine failed:', error);
         return throwError(() => error);
       })
     );
   }
   ```

2. **`/frontend/src/app/features/batches/batch-detail/batch-detail.component.ts`**
   ```typescript
   export class BatchDetailComponent implements OnInit {
     batchService = inject(BatchService);
     toastService = inject(ToastService);
     dialog = inject(MatDialog);
     
     batch = signal<Batch | null>(null);
     isLoading = signal(false);
     
     ngOnInit() {
       this.loadBatch();
     }
     
     loadBatch() {
       const batchId = +this.route.snapshot.paramMap.get('id')!;
       this.isLoading.set(true);
       this.batchService.getById(batchId)
         .pipe(finalize(() => this.isLoading.set(false)))
         .subscribe({
           next: (batch) => this.batch.set(batch),
           error: (err) => this.toastService.error('Failed to load batch')
         });
     }
     
     onQuarantine() {
       const dialogRef = this.dialog.open(QuarantineModalComponent, {
         data: { batch: this.batch() }
       });
       
       dialogRef.afterClosed().subscribe(result => {
         if (result?.reason) {
           this.quarantineBatch(result.reason);
         }
       });
     }
     
     quarantineBatch(reason: string) {
       this.isLoading.set(true);
       this.batchService.quarantine(this.batch()!.id, reason)
         .pipe(finalize(() => this.isLoading.set(false)))
         .subscribe({
           next: (updatedBatch) => {
             this.batch.set(updatedBatch);
             this.toastService.success('Batch quarantined successfully');
           },
           error: (err) => {
             this.toastService.error(err.error?.msg || 'Failed to quarantine batch');
           }
         });
     }
     
     isQuarantineDisabled = computed(() => 
       this.batch()?.status !== 'ACTIVE'
     );
   }
   ```

3. **`/frontend/src/app/features/batches/batch-detail/quarantine-modal.component.ts`** (NEW)
   ```typescript
   @Component({
     selector: 'app-quarantine-modal',
     standalone: true,
     imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule],
     template: `
       <h2 mat-dialog-title>Quarantine Batch</h2>
       <mat-dialog-content>
         <p><strong>Lot Number:</strong> {{ data.batch.lotNumber }}</p>
         <p><strong>Product:</strong> {{ data.batch.productName }}</p>
         <p><strong>Current Qty:</strong> {{ data.batch.quantity }} units</p>
         
         <form [formGroup]="form">
           <mat-form-field class="full-width">
             <mat-label>Reason for Quarantine</mat-label>
             <textarea matInput formControlName="reason" rows="4"></textarea>
             <mat-error *ngIf="form.get('reason')?.hasError('required')">
               Reason is required
             </mat-error>
             <mat-error *ngIf="form.get('reason')?.hasError('minlength')">
               Reason must be at least 10 characters
             </mat-error>
           </mat-form-field>
         </form>
       </mat-dialog-content>
       <mat-dialog-actions align="end">
         <button mat-button (click)="onCancel()">Cancel</button>
         <button mat-raised-button color="warn" 
                 [disabled]="!form.valid || isSubmitting()"
                 (click)="onConfirm()">
           <span *ngIf="!isSubmitting()">Quarantine</span>
           <mat-spinner *ngIf="isSubmitting()" diameter="20"></mat-spinner>
         </button>
       </mat-dialog-actions>
     `
   })
   export class QuarantineModalComponent {
     dialogRef = inject(MatDialogRef<QuarantineModalComponent>);
     data: { batch: Batch } = inject(MAT_DIALOG_DATA);
     formBuilder = inject(FormBuilder);
     
     form = this.formBuilder.group({
       reason: ['', [Validators.required, Validators.minLength(10)]]
     });
     
     isSubmitting = signal(false);
     
     onCancel() {
       this.dialogRef.close();
     }
     
     onConfirm() {
       if (!this.form.valid) return;
       this.dialogRef.close({ reason: this.form.value.reason });
     }
   }
   ```

4. **`/frontend/src/app/features/batches/batch-detail/batch-detail.component.html`** (MODIFY)
   ```html
   <div class="batch-detail-container">
     <div *ngIf="isLoading()" class="spinner-container">
       <app-spinner label="Loading batch details..."></app-spinner>
     </div>
     
     <div *ngIf="!isLoading() && batch()" class="batch-info">
       <h1>{{ batch()!.lotNumber }}</h1>
       
       <div class="batch-actions">
         <button (click)="onQuarantine()" 
                 [disabled]="isQuarantineDisabled()"
                 class="btn btn-warning">
           Quarantine
         </button>
         <!-- More actions... -->
       </div>
       
       <div class="status-badge" [ngClass]="'status-' + batch()!.status">
         {{ batch()!.status }}
       </div>
       
       <!-- Rest of batch detail... -->
     </div>
   </div>
   ```

**Backend Endpoint (Verify):**

```bash
# Test endpoint
curl -X PUT "http://localhost:8080/api/v0/batches/1/quarantine?reason=Found%20contamination" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json"

# Expected response (200):
{
  "id": 1,
  "lotNumber": "LOT-2024-001",
  "productId": 2,
  "productName": "Saline Solution",
  "quantity": 100,
  "status": "QUARANTINE",
  "expirationDate": "2025-06-30T00:00:00"
}
```

**API Contract:**

| Aspect | Details |
|--------|---------|
| **URL** | `PUT /api/v0/batches/{id}/quarantine` |
| **Query Params** | `reason` (required, string) |
| **Auth** | Required (Bearer token, role ADMIN or PHARMACIAN) |
| **Request Body** | None (empty body) |
| **Response (200)** | Updated batch object with `status: "QUARANTINE"` |
| **Response (400)** | `{error: "Batch not in ACTIVE status"}` |
| **Response (404)** | `{error: "Batch not found"}` |
| **Response (409)** | `{error: "Batch already quarantined"}` |

---

#### **Testing Strategy**

**Unit Tests:**
```typescript
describe('BatchDetailComponent - Quarantine', () => {
  let component: BatchDetailComponent;
  let fixture: ComponentFixture<BatchDetailComponent>;
  let batchService: jasmine.SpyObj<BatchService>;
  let toastService: jasmine.SpyObj<ToastService>;

  beforeEach(async () => {
    const batchSpy = jasmine.createSpyObj('BatchService', ['getById', 'quarantine']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['success', 'error']);
    
    await TestBed.configureTestingModule({
      providers: [
        { provide: BatchService, useValue: batchSpy },
        { provide: ToastService, useValue: toastSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BatchDetailComponent);
    component = fixture.componentInstance;
    batchService = TestBed.inject(BatchService) as jasmine.SpyObj<BatchService>;
    toastService = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
  });

  it('should disable quarantine button when batch not ACTIVE', () => {
    component.batch.set({ ...mockBatch, status: 'QUARANTINE' });
    expect(component.isQuarantineDisabled()).toBe(true);
  });

  it('should call batchService.quarantine on confirmation', () => {
    const reason = 'Found contamination evidence';
    component.batch.set({ ...mockBatch, status: 'ACTIVE', id: 1 });
    batchService.quarantine.and.returnValue(of({ ...mockBatch, status: 'QUARANTINE' }));
    
    component.quarantineBatch(reason);

    expect(batchService.quarantine).toHaveBeenCalledWith(1, reason);
  });

  it('should show success toast after quarantine', (done) => {
    batchService.quarantine.and.returnValue(of({ ...mockBatch, status: 'QUARANTINE' }));
    component.quarantineBatch('Contamination');

    setTimeout(() => {
      expect(toastService.success).toHaveBeenCalledWith('Batch quarantined successfully');
      done();
    }, 100);
  });
});
```

**Manual QA Steps:**
1. Log in as pharmacy manager
2. Navigate to batch detail page (e.g., /batches/1)
3. Verify batch status is ACTIVE
4. Click "Quarantine" button
5. Modal appears with batch info
6. Try entering reason with < 10 characters, "Quarantine" button disabled
7. Enter reason "Found contamination during audit"
8. Click "Quarantine"
9. Modal closes, batch status changes to QUARANTINE (yellow badge)
10. Toast shows success message
11. Refresh page, verify status persists

---

---

### TASK 1.3: Transaction Error Handling

**User Story:**  
> As a **stock clerk**, I want to **see clear error messages** when a stock movement fails so that **I understand what went wrong and how to fix it**.

**Priority:** HIGH  
**Effort Estimate:**
- Design/Specs: 1.5h
- Development: 6h
- Testing: 1.5h
- Total: 9h

---

#### **Acceptance Criteria**

- [ ] User navigates to stock movement page
- [ ] User selects transaction type: OUT (stock deduction)
- [ ] User selects product and batch
- [ ] Current batch quantity displayed (e.g., "Available: 50 units")
- [ ] User enters quantity: 60 (more than available)
- [ ] User clicks "Record Transaction"
- [ ] API call fails: 400 error "Insufficient stock"
- [ ] Modal/toast shows friendly error: "Not enough stock. Available: 50 units, requested: 60"
- [ ] "Record Transaction" button enabled again (can retry)
- [ ] Transaction is NOT recorded (verified in audit log)
- [ ] User reduces quantity to 50 and retries
- [ ] Transaction succeeds, success toast shown
- [ ] All transaction types (IN/OUT/RETURN) have error handling
- [ ] Network timeouts show "Request timed out, please retry"
- [ ] 500 errors show "Server error, please contact support"
- [ ] Double-submit prevented (button disabled during request)

---

#### **Technical Implementation**

**Files to Modify:**

1. **`/frontend/src/app/services/transaction.service.ts`**
   ```typescript
   record(transaction: TransactionRequest): Observable<Transaction> {
     return this.http.post<Transaction>(
       `${this.apiUrl}/transactions`,
       transaction,
       { timeout: 10000 } // 10 second timeout
     ).pipe(
       retry({ count: 0, delay: 0 }), // Don't auto-retry, let UI handle it
       catchError(error => {
         console.error('Transaction recording failed:', error);
         // Re-throw with user-friendly message
         const userMessage = this.parseError(error);
         return throwError(() => ({
           ...error,
           userMessage: userMessage
         }));
       })
     );
   }
   
   private parseError(error: HttpErrorResponse): string {
     // Insufficient stock (400)
     if (error.status === 400 && error.error?.msg?.includes('Insufficient stock')) {
       const match = error.error.msg.match(/available: (\d+), requested: (\d+)/i);
       if (match) {
         return `Not enough stock. Available: ${match[1]} units, requested: ${match[2]} units`;
       }
       return error.error?.msg || 'Invalid transaction data';
     }
     
     // Batch not found (404)
     if (error.status === 404) {
       return 'Batch not found. It may have been deleted.';
     }
     
     // Timeout (0 or specific timeout error)
     if (error.status === 0 || error.name === 'TimeoutError') {
       return 'Request timed out. Please check your connection and retry.';
     }
     
     // Server error (5xx)
     if (error.status >= 500) {
       return 'Server error. Please contact system support.';
     }
     
     // Generic fallback
     return error.error?.msg || 'Failed to record transaction. Please try again.';
   }
   ```

2. **`/frontend/src/app/features/transactions/stock-movement.component.ts`**
   ```typescript
   export class StockMovementComponent implements OnInit {
     transactionService = inject(TransactionService);
     toastService = inject(ToastService);
     batchService = inject(BatchService);
     formBuilder = inject(FormBuilder);
     
     form = this.formBuilder.group({
       type: ['OUT', Validators.required],
       batchId: ['', Validators.required],
       quantity: [1, [Validators.required, Validators.min(1)]],
       reason: ['', Validators.required]
     });
     
     isSubmitting = signal(false);
     batchQuantity = signal(0);
     retryCount = signal(0);
     lastError = signal<string | null>(null);
     
     ngOnInit() {
       // Update batch quantity when batch selected
       this.form.get('batchId')?.valueChanges
         .pipe(
           switchMap(batchId => this.batchService.getById(+batchId)),
           takeUntilDestroyed(this.destroyRef)
         )
         .subscribe({
           next: (batch) => this.batchQuantity.set(batch.quantity),
           error: () => this.batchQuantity.set(0)
         });
     }
     
     onRecordTransaction() {
       if (!this.form.valid) {
         this.toastService.error('Please fill all required fields');
         return;
       }
       
       // Validate quantity for OUT transactions
       if (this.form.value.type === 'OUT' && 
           this.form.value.quantity! > this.batchQuantity()) {
         this.toastService.error(
           `Not enough stock. Available: ${this.batchQuantity()} units`
         );
         return;
       }
       
       this.isSubmitting.set(true);
       this.lastError.set(null);
       
       const txnRequest: TransactionRequest = {
         type: this.form.value.type as TransactionType,
         batchId: +this.form.value.batchId!,
         quantity: this.form.value.quantity!,
         reason: this.form.value.reason!
       };
       
       this.transactionService.record(txnRequest)
         .pipe(
           finalize(() => this.isSubmitting.set(false)),
           takeUntilDestroyed(this.destroyRef)
         )
         .subscribe({
           next: (txn) => {
             this.toastService.success(
               `Transaction recorded: ${txn.type} ${txn.quantity} units`
             );
             this.form.reset({ type: 'OUT' });
             this.retryCount.set(0);
           },
           error: (err) => {
             const errorMsg = err.userMessage || err.error?.msg || 'Unknown error';
             this.lastError.set(errorMsg);
             this.toastService.error(errorMsg);
             this.retryCount.update(c => c + 1);
             
             // Log error for debugging
             if (this.retryCount() > 2) {
               console.error('Transaction failed after 3 attempts:', err);
             }
           }
         });
     }
     
     onRetry() {
       this.onRecordTransaction();
     }
     
     canRetry = computed(() => 
       this.lastError() !== null && this.retryCount() < 3
     );
   }
   ```

3. **`/frontend/src/app/features/transactions/stock-movement.component.html`** (MODIFY)
   ```html
   <div class="stock-movement-form">
     <form [formGroup]="form" (ngSubmit)="onRecordTransaction()">
       
       <!-- Transaction Type -->
       <div class="form-group">
         <label>Transaction Type *</label>
         <select formControlName="type">
           <option value="IN">Stock In</option>
           <option value="OUT">Stock Out</option>
           <option value="RETURN">Return</option>
         </select>
       </div>
       
       <!-- Batch Selection -->
       <div class="form-group">
         <label>Batch/Lot *</label>
         <input type="text" formControlName="batchId" placeholder="Select batch">
         <small *ngIf="form.value.type === 'OUT'" class="text-muted">
           Available: {{ batchQuantity() }} units
         </small>
       </div>
       
       <!-- Quantity -->
       <div class="form-group">
         <label>Quantity *</label>
         <input type="number" formControlName="quantity" min="1">
         <mat-error *ngIf="form.get('quantity')?.hasError('min')">
           Quantity must be at least 1
         </mat-error>
       </div>
       
       <!-- Reason -->
       <div class="form-group">
         <label>Reason *</label>
         <textarea formControlName="reason"></textarea>
       </div>
       
       <!-- Error Message (if exists) -->
       <div *ngIf="lastError()" class="error-banner">
         <p>{{ lastError() }}</p>
         <button type="button" (click)="onRetry()" *ngIf="canRetry()">
           Retry
         </button>
       </div>
       
       <!-- Submit Button -->
       <div class="form-actions">
         <button type="submit" 
                 [disabled]="!form.valid || isSubmitting()"
                 class="btn btn-primary">
           <span *ngIf="!isSubmitting()">Record Transaction</span>
           <mat-spinner *ngIf="isSubmitting()" diameter="16"></mat-spinner>
         </button>
       </div>
     </form>
   </div>
   ```

**Backend Endpoint (Verify):**

```bash
# Test case 1: Success
curl -X POST http://localhost:8080/api/v0/transactions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "OUT",
    "batchId": 1,
    "quantity": 50,
    "reason": "Daily dispensing"
  }'
# Expected: 201 with transaction object

# Test case 2: Insufficient stock
curl -X POST http://localhost:8080/api/v0/transactions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "OUT",
    "batchId": 1,
    "quantity": 1000,
    "reason": "Attempt overdraw"
  }'
# Expected: 400 with {error: "Insufficient stock: available: 50, requested: 1000"}

# Test case 3: Invalid batch
curl -X POST http://localhost:8080/api/v0/transactions \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "OUT",
    "batchId": 99999,
    "quantity": 10,
    "reason": "Nonexistent batch"
  }'
# Expected: 404 with {error: "Batch not found"}
```

**Manual QA Steps:**
1. Log in
2. Navigate to /stock-movement
3. Select Type: OUT
4. Select Batch with quantity 50
5. Verify "Available: 50" displays
6. Enter Quantity: 60
7. Click "Record Transaction"
8. Error appears: "Not enough stock. Available: 50 units, requested: 60"
9. "Retry" button available
10. Change Quantity to 50
11. Click "Retry" or submit again
12. Success toast appears
13. Transaction recorded to audit log

---

---

### TASK 1.4: Batch Search Pagination

**User Story:**  
> As a **inventory auditor**, I want to **view search results in pages** so that **the UI is not overwhelming with 1000+ results and pages load quickly**.

**Priority:** HIGH  
**Effort Estimate:**
- Design/Specs: 1h
- Development: 5h
- Testing: 2h
- Total: 8h

---

#### **Acceptance Criteria**

- [ ] User navigates to batch search page
- [ ] User searches for batches (e.g., "Saline")
- [ ] If < 20 results: All results shown, no pagination controls
- [ ] If >= 20 results: First 20 shown, pagination controls appear
- [ ] Pagination shows: "Page 1 of 5" (for 100 results)
- [ ] "Previous" button disabled on page 1
- [ ] "Next" button enabled on page 1 (if more pages)
- [ ] User clicks "Next"
- [ ] Results update to show items 21-40
- [ ] Page counter updates: "Page 2 of 5"
- [ ] "Previous" button now enabled
- [ ] User can click "Previous" to go back
- [ ] Clicking page numbers (if using numbered pagination) jumps directly
- [ ] Batch total count shown (e.g., "Showing 21-40 of 100 batches")
- [ ] Search is maintained when paginating (don't lose filter)
- [ ] Performance: Page changes in < 500ms

---

#### **Technical Implementation**

**Files to Modify:**

1. **`/frontend/src/app/features/batches/batch-search.component.ts`**
   ```typescript
   export class BatchSearchComponent implements OnInit {
     batchService = inject(BatchService);
     toastService = inject(ToastService);
     
     searchTerm = signal('');
     allResults = signal<Batch[]>([]);
     currentPage = signal(0);
     pageSize = signal(20);
     isSearching = signal(false);
     
     private readonly PAGE_SIZE = 20;
     
     ngOnInit() {
       // Debounced search
       this.searchTerm.effect(() => {
         this.search();
       });
     }
     
     search() {
       const term = this.searchTerm();
       if (!term.trim()) {
         this.allResults.set([]);
         this.currentPage.set(0);
         return;
       }
       
       this.isSearching.set(true);
       this.currentPage.set(0); // Reset to first page
       
       this.batchService.search(term)
         .pipe(
           finalize(() => this.isSearching.set(false))
         )
         .subscribe({
           next: (results) => this.allResults.set(results),
           error: () => {
             this.toastService.error('Search failed');
             this.allResults.set([]);
           }
         });
     }
     
     // Pagination computed properties
     paginatedResults = computed(() => {
       const results = this.allResults();
       const start = this.currentPage() * this.PAGE_SIZE;
       const end = start + this.PAGE_SIZE;
       return results.slice(start, end);
     });
     
     totalPages = computed(() => 
       Math.ceil(this.allResults().length / this.PAGE_SIZE)
     );
     
     currentPageDisplay = computed(() => 
       this.allResults().length === 0 ? 0 : this.currentPage() + 1
     );
     
     resultStart = computed(() => 
       this.allResults().length === 0 ? 0 : (this.currentPage() * this.PAGE_SIZE) + 1
     );
     
     resultEnd = computed(() => {
       const end = (this.currentPage() + 1) * this.PAGE_SIZE;
       return Math.min(end, this.allResults().length);
     });
     
     hasNextPage = computed(() => 
       this.currentPage() < this.totalPages() - 1
     );
     
     hasPreviousPage = computed(() => 
       this.currentPage() > 0
     );
     
     onNextPage() {
       if (this.hasNextPage()) {
         this.currentPage.update(p => p + 1);
       }
     }
     
     onPreviousPage() {
       if (this.hasPreviousPage()) {
         this.currentPage.update(p => p - 1);
       }
     }
     
     onGoToPage(pageNum: number) {
       if (pageNum >= 0 && pageNum < this.totalPages()) {
         this.currentPage.set(pageNum);
       }
     }
   }
   ```

2. **`/frontend/src/app/features/batches/batch-search.component.html`** (MODIFY)
   ```html
   <div class="batch-search-container">
     <!-- Search Input -->
     <div class="search-box">
       <input type="text" 
              [(ngModel)]="searchTerm"
              placeholder="Search by lot number or product name..."
              class="search-input">
       <span *ngIf="isSearching()" class="loading-indicator">
         <mat-spinner diameter="20"></mat-spinner>
       </span>
     </div>
     
     <!-- Results Info -->
     <div class="results-info">
       <span *ngIf="allResults().length > 0">
         Showing {{ resultStart() }}-{{ resultEnd() }} of {{ allResults().length }} batches
       </span>
       <span *ngIf="allResults().length === 0 && !isSearching()">
         No batches found
       </span>
     </div>
     
     <!-- Results Table -->
     <div class="results-table">
       <table>
         <thead>
           <tr>
             <th>Lot Number</th>
             <th>Product</th>
             <th>Quantity</th>
             <th>Expiration</th>
             <th>Status</th>
             <th>Actions</th>
           </tr>
         </thead>
         <tbody>
           <tr *ngFor="let batch of paginatedResults()">
             <td>{{ batch.lotNumber }}</td>
             <td>{{ batch.productName }}</td>
             <td>{{ batch.quantity }}</td>
             <td>{{ batch.expirationDate | date:'MMM dd, yyyy' }}</td>
             <td>
               <span class="badge" [ngClass]="'badge-' + batch.status">
                 {{ batch.status }}
               </span>
             </td>
             <td>
               <a [routerLink]="['/batches', batch.id]">View</a>
             </td>
           </tr>
         </tbody>
       </table>
     </div>
     
     <!-- Pagination Controls -->
     <div class="pagination-controls" *ngIf="totalPages() > 1">
       <button (click)="onPreviousPage()" 
               [disabled]="!hasPreviousPage()"
               class="btn btn-sm">
         ← Previous
       </button>
       
       <span class="page-info">
         Page {{ currentPageDisplay() }} of {{ totalPages() }}
       </span>
       
       <button (click)="onNextPage()" 
               [disabled]="!hasNextPage()"
               class="btn btn-sm">
         Next →
       </button>
     </div>
   </html>
   ```

**Manual QA Steps:**
1. Search for "Saline" (assuming 100+ results)
2. Verify first 20 results shown
3. Verify pagination info: "Showing 1-20 of 100 batches"
4. Verify "Previous" button disabled
5. Verify "Next" button enabled
6. Click "Next"
7. Verify results change to items 21-40
8. Verify page counter: "Page 2 of 5"
9. Verify "Previous" button now enabled
10. Click "Previous" to go back to page 1
11. Verify results match first page
12. Try changing search term, verify pagination resets to page 1

---

---

### TASK 1.5: Loading & Empty States Consistency

**User Story:**  
> As a **hospital user**, I want to **see clear loading indicators and empty state messages** so that **I know when the app is working and what to do when there's no data**.

**Priority:** MEDIUM  
**Effort Estimate:**
- Design/Specs: 1h
- Development: 4h
- Testing: 1h
- Total: 6h

---

#### **Acceptance Criteria**

- [ ] All data-fetching pages show spinner with label during load
- [ ] All spinners use consistent styling and animation
- [ ] Spinner labels follow format: "Loading {entity}..." (e.g., "Loading batches...")
- [ ] All empty state messages follow format: "No {entity} found. {action}" (e.g., "No batches found. Try searching")
- [ ] Empty state only shows AFTER loading completes (not simultaneously)
- [ ] Dashboard shows spinners for each widget independently (not blocking whole page)
- [ ] Batch search shows spinner during search execution
- [ ] Product list shows spinner during load
- [ ] Transaction history shows spinner during load
- [ ] No console errors related to loading states
- [ ] Spinners disappear when data loads successfully
- [ ] Spinners disappear when error occurs (error shown instead)

---

#### **Technical Implementation**

**Audit Checklist - Review Each Component:**

1. **Dashboard** (`dashboard.component.ts`)
   - [ ] Add isLoading signals for each widget
   - [ ] Show spinner per widget (not blocking full page)
   - Labels: "Loading recent activity...", "Loading expiration alerts..."

2. **Batch Search** (`batch-search.component.ts`)
   - [ ] Add isSearching signal
   - [ ] Show spinner during search
   - [ ] Label: "Searching batches..."

3. **Product Search** (`product-search.component.ts`)
   - [ ] Add isLoading signal
   - [ ] Show spinner during initial load
   - [ ] Label: "Loading products..."

4. **Batch Detail** (`batch-detail.component.ts`)
   - [ ] Add isLoading signal
   - [ ] Show spinner until batch + transactions load
   - [ ] Label: "Loading batch details..."

5. **Stock Movement** (`stock-movement.component.ts`)
   - [ ] Add isLoading signal for batch lookup modal
   - [ ] Label: "Searching batches..."

**Template Examples:**

```html
<!-- Loading State (Spinner) -->
<div *ngIf="isLoading()" class="spinner-container">
  <app-spinner label="Loading batches..."></app-spinner>
</div>

<!-- Content (show when NOT loading and has data) -->
<div *ngIf="!isLoading() && items().length > 0" class="content">
  <!-- List items -->
</div>

<!-- Empty State (show when NOT loading and NO data) -->
<div *ngIf="!isLoading() && items().length === 0" class="empty-state">
  <p>No batches found. Try adjusting your search filters.</p>
</div>
```

**CSS for Consistency:**

```css
.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #f5f5f5;
  border-radius: 8px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 40px;
  text-align: center;
  color: #999;
  background: #fafafa;
  border-radius: 8px;
  border: 1px dashed #ddd;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
```

---

---

### TASK 1.6: Auth Interceptor Enhancements

**User Story:**  
> As a **system administrator**, I want to **ensure token expiration is handled gracefully** so that **users are not seeing console errors or broken states when their session expires**.

**Priority:** HIGH  
**Effort Estimate:**
- Design/Specs: 1h
- Development: 4h
- Testing: 2h
- Total: 7h

---

#### **Acceptance Criteria**

- [ ] When API returns 401 (Unauthorized), user is redirected to login
- [ ] JWT token is cleared from localStorage on 401
- [ ] Toast shows: "Your session expired. Please log in again."
- [ ] User can log back in without page reload
- [ ] Network timeout (> 10 seconds) shows error: "Request timed out. Please check your connection."
- [ ] Network error (no internet) shows: "No internet connection. Please check your network."
- [ ] 5xx server errors show: "Server error. Please try again later."
- [ ] Failed requests are NOT retried automatically (user decides)
- [ ] Request/response logging available for debugging
- [ ] CORS errors show helpful message (not raw browser error)
- [ ] All HTTP requests include JWT token in Authorization header
- [ ] Token refresh implemented (if backend supports it)

---

#### **Technical Implementation**

**Files to Modify:**

1. **`/frontend/src/app/services/auth.interceptor.ts`**
   ```typescript
   @Injectable()
   export class AuthInterceptor implements HttpInterceptor {
     authService = inject(AuthService);
     toastService = inject(ToastService);
     router = inject(Router);
     
     intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
       // Add JWT token to request
       const token = this.authService.getAccessToken();
       if (token) {
         request = request.clone({
           setHeaders: {
             Authorization: `Bearer ${token}`
           }
         });
       }
       
       return next.handle(request).pipe(
         timeout(10000), // 10 second timeout
         catchError(error => this.handleError(error))
       );
     }
     
     private handleError(error: HttpErrorResponse | TimeoutError): Observable<never> {
       let userMessage = 'An error occurred';
       
       // Timeout error
       if (error instanceof TimeoutError) {
         userMessage = 'Request timed out. Please check your connection and try again.';
         console.warn('Request timeout', error);
         this.toastService.error(userMessage);
         return throwError(() => error);
       }
       
       // Network error (status 0)
       if (error.status === 0) {
         userMessage = 'Network error. Please check your connection.';
         console.error('Network error:', error);
         this.toastService.error(userMessage);
         return throwError(() => ({
           ...error,
           userMessage: userMessage
         }));
       }
       
       // Unauthorized (401) - Token expired
       if (error.status === 401) {
         userMessage = 'Your session expired. Please log in again.';
         console.warn('Unauthorized (401), redirecting to login');
         this.authService.logout(); // Clear token
         this.router.navigate(['/login']);
         this.toastService.warning(userMessage);
         return throwError(() => ({
           ...error,
           userMessage: userMessage
         }));
       }
       
       // Forbidden (403)
       if (error.status === 403) {
         userMessage = 'You do not have permission to perform this action.';
         console.warn('Forbidden (403):', error);
         this.toastService.error(userMessage);
         return throwError(() => ({
           ...error,
           userMessage: userMessage
         }));
       }
       
       // Not found (404)
       if (error.status === 404) {
         // Don't show toast for 404 - let component handle it
         console.warn('Not found (404):', error.url);
         return throwError(() => error);
       }
       
       // Server error (5xx)
       if (error.status >= 500) {
         userMessage = 'Server error. Please try again later or contact support.';
         console.error('Server error (5xx):', error);
         this.toastService.error(userMessage);
         return throwError(() => ({
           ...error,
           userMessage: userMessage
         }));
       }
       
       // Client error (4xx) - let component handle specific message
       if (error.status >= 400 && error.status < 500) {
         console.warn('Client error (4xx):', error.status, error.error);
         return throwError(() => error);
       }
       
       // Unknown error
       console.error('Unknown error:', error);
       this.toastService.error(userMessage);
       return throwError(() => ({
         ...error,
         userMessage: userMessage
       }));
     }
   }
   ```

2. **`/frontend/src/app/services/auth.service.ts`** (MODIFY)
   ```typescript
   logout() {
     this.currentUserSignal.set(null);
     localStorage.removeItem('access_token');
     localStorage.removeItem('current_user');
     this.router.navigate(['/login']);
   }
   ```

3. **`/frontend/src/main.ts`** (VERIFY setup)
   ```typescript
   // Ensure HTTP_INTERCEPTORS are configured
   bootstrapApplication(AppComponent, {
     providers: [
       provideHttpClient(
         withInterceptors([authInterceptor])
       ),
       // ... other providers
     ]
   });
   ```

**Manual QA Steps:**

1. **Test Token Expiration (401):**
   - Log in successfully
   - Manually clear token in localStorage (browser DevTools)
   - Try to load a protected page
   - Verify: Redirected to login, toast shows "Your session expired"

2. **Test Network Timeout:**
   - Open browser DevTools → Network tab
   - Throttle to "Offline"
   - Try to perform an API call (search batches, etc.)
   - Verify: Toast shows "Network error. Please check your connection."

3. **Test Server Error (5xx):**
   - Mock a 500 error using a backend test endpoint
   - Verify: Toast shows "Server error"

4. **Test Authorization Header:**
   - Log in
   - Open browser DevTools → Network tab
   - Make API call
   - Check request headers: Authorization: Bearer {JWT_TOKEN} present

---

---

## 📅 WEEK-BY-WEEK SPRINT PLAN

### Week 1: Core Features

**Monday-Tuesday (Days 1-2)**
- **T1.1** (User Profile): Dev 1 - 8 hours
- **T1.5** (UI States): Dev 3 - 6 hours (can start immediately, independent)
- **Backend Pre-flight Check**: Dev 4 - 2 hours

**Wednesday-Thursday (Days 3-4)**
- **T1.2** (Batch Quarantine): Dev 1 - 10 hours (depends on T1.1 completion)
- **T1.6** (Auth Interceptor): Dev 3 - 7 hours (can start independently)

**Friday (Day 5)**
- **T1.3** (Error Handling): Dev 2 - 9 hours (start of day)
- **T1.4** (Pagination): Dev 2 - 8 hours (parallel with T1.3)
- **Code Review & QA**: All devs - 3 hours

**Weekend**: Bug fixes + test data prep

---

### Week 2: Integration & Testing

**Monday-Tuesday (Days 6-7)**
- Finish remaining tasks if overrun from Week 1
- Fix code review comments
- Run integration tests across all tasks
- Frontend + backend end-to-end testing

**Wednesday-Thursday (Days 8-9)**
- UAT preparation (create test scenarios)
- Performance testing (response times < 1s)
- Security testing (OWASP Top 10 quick check)
- Documentation (README, deployment guide)

**Friday (Day 10)**
- Deploy to staging environment
- Final smoke tests
- Handoff to hospital for UAT

---

### Week 3: UAT & Launch

**Monday-Wednesday (Days 11-13)**
- Hospital user testing (UAT)
- Bug fix (P1 critical, P2 important)
- Training documentation

**Thursday (Day 14)**
- Final QA sign-off
- Security audit completion
- Deployment readiness check

**Friday (Day 15)**
- 🚀 Production launch
- On-call support for first 8 hours

---

## ✅ INTEGRATION CHECKLIST

### Pre-Flight Checks (Before Week 1)

- [ ] **Backend API running**: `./mvnw spring-boot:run`
- [ ] **Frontend dev server running**: `npm start`
- [ ] **Database seeded**: Test users + sample batches present
- [ ] **API endpoints tested**: All 38 endpoints respond with 200/201/400 appropriately
- [ ] **JWT token working**: Login returns token, subsequent requests succeed
- [ ] **CORS configured**: Frontend → Backend calls work (no CORS errors)
- [ ] **Database indexes created**: Query performance acceptable
- [ ] **Git branches created**: Main, develop, feature branches
- [ ] **CI/CD pipeline ready**: Automated tests run on push

---

### Per-Task Verification

**After T1.1 (User Profile Save):**
- [ ] User can see profile form
- [ ] User can update email
- [ ] API call succeeds (verified in Network tab)
- [ ] Updated email persists after page reload
- [ ] Error handling works (try invalid email)

**After T1.2 (Batch Quarantine):**
- [ ] Quarantine button visible on batch detail page
- [ ] Modal appears on button click
- [ ] Quarantine succeeds (status changes to QUARANTINE)
- [ ] Batch status changes immediately in UI
- [ ] Error handling works (try already-quarantined batch)

**After T1.3 (Error Handling):**
- [ ] Transaction succeeds with valid data
- [ ] Insufficient stock error handled
- [ ] Error message is user-friendly
- [ ] Retry button works

**After T1.4 (Pagination):**
- [ ] Pagination controls appear for > 20 results
- [ ] Page navigation works (next, previous, page numbers)
- [ ] Page counter accurate
- [ ] Search maintains state across pages

**After T1.5 (UI States):**
- [ ] Spinners appear during data load
- [ ] Spinner labels consistent
- [ ] Empty state messages show when appropriate
- [ ] No overlapping spinners and empty messages

**After T1.6 (Auth Interceptor):**
- [ ] All API requests include Authorization header
- [ ] 401 redirects to login
- [ ] Network errors show user-friendly message
- [ ] Timeout errors handled

---

### Post-Integration Smoke Tests (All 6 Tasks)

**Test User Journey 1: Stock Clerk - Record Stock Movement**
1. Log in as `pharmacist_1`
2. Navigate to /stock-movement
3. Select OUT type
4. Search and select batch
5. Enter quantity (valid amount)
6. Click Record
7. Verify: Success toast, transaction recorded
8. Check audit log (verify entry created)

**Test User Journey 2: Pharmacy Manager - Quarantine Batch**
1. Log in as `admin` (if permission allows)
2. Navigate to /batches
3. Search for batch
4. Click on batch detail
5. Click Quarantine button
6. Enter reason
7. Click Quarantine
8. Verify: Status changes to QUARANTINE
9. Try to use batch in stock movement (should fail or show warning)

**Test User Journey 3: User - Update Profile**
1. Log in as `pharmacist_1`
2. Navigate to /account
3. Update email
4. Click Save
5. Verify: Success toast, email updated
6. Log out and log back in
7. Verify: Email change persists

---

## 🚨 RISK REGISTER

| Risk ID | Description | Impact | Likelihood | Mitigation | Owner | Target |
|---------|-------------|--------|-----------|-----------|-------|--------|
| **R1** | Optimistic locking conflicts on batch updates (version mismatch) | HIGH | MEDIUM | Test concurrent updates; catch OptimisticLockException and show user-friendly error | Backend Dev | End of W1 |
| **R2** | JWT token refresh not implemented; users lose session mid-task | MEDIUM | LOW | Add auto-refresh 5 min before expiry OR implement refresh endpoint | Frontend Dev | End of W1 |
| **R3** | Batch quarantine doesn't prevent further transactions (no DB constraint) | HIGH | HIGH | Add DB trigger or JPA validation; test transaction on quarantined batch | Backend Dev | Start of W1 |
| **R4** | Transaction quantity deduction causes race condition (concurrent OUTs) | CRITICAL | MEDIUM | Add SELECT ... FOR UPDATE in batch quantity update; test with load tool | Backend Dev | Mid W1 |
| **R5** | Insufficient stock error message from backend too technical ("StockException") | MEDIUM | MEDIUM | Standardize error messages in backend error handler | Backend Dev | Start of W1 |
| **R6** | Audit log grows unbounded; query performance degrades | MEDIUM | LOW | Add archival strategy; test with 100k audit entries | DB Admin | End of W2 |
| **R7** | CORS blocking frontend→backend requests (no headers configured) | HIGH | HIGH | Configure CORS in Spring Security; test cross-origin requests | Backend Dev | Pre-flight check |
| **R8** | Password change form exists but doesn't call API (orphaned form) | LOW | LOW | Remove form or implement endpoint | Frontend Dev | End of W1 |
| **R9** | localStorage not cleared on logout; token still in DevTools | MEDIUM | MEDIUM | Clear all auth-related keys; test localStorage empty after logout | Frontend Dev | End of W1 |
| **R10** | Frontend service methods don't match backend response shape (field name mismatch) | MEDIUM | MEDIUM | Use Swagger/OpenAPI to verify schema; check DTOs match interfaces | Frontend Dev | Start of W1 |

---

## 📖 DEFINITION OF DONE

### Code Quality

- [ ] **Compiles without errors or warnings**
- [ ] **No console errors or warnings** (even after page reload)
- [ ] **No TypeScript strict mode violations** (tsconfig.json: strict: true)
- [ ] **No unused imports or variables**
- [ ] **Follows Angular style guide** (camelCase, PascalCase for components)
- [ ] **Follows code conventions** (consistent with existing codebase)

### Testing

- [ ] **Unit tests written** (Jasmine/Karma)
- [ ] **Unit test coverage >= 80%** for modified files
- [ ] **Integration tests pass** (mock backend or real)
- [ ] **Manual QA sign-off** (tester confirms acceptance criteria)
- [ ] **No regressions** (all existing tests still pass)

### Functionality

- [ ] **All acceptance criteria met**
- [ ] **Happy path tested** (success case)
- [ ] **Error cases handled** (user sees error message, not crash)
- [ ] **Edge cases tested** (empty data, null values, etc.)
- [ ] **Performance acceptable** (< 1s for API calls, < 2s for page load)

### Security

- [ ] **No hardcoded secrets** (API keys, passwords)
- [ ] **No SQL injection vulnerabilities** (backend using parameterized queries)
- [ ] **No XSS vulnerabilities** (frontend sanitizing user input)
- [ ] **CORS properly configured** (not * for production)
- [ ] **Authentication required** for protected endpoints

### Accessibility

- [ ] **WCAG AA compliant** (axe devtools check)
- [ ] **Keyboard navigable** (tab through all controls)
- [ ] **Screen reader compatible** (ARIA labels where needed)
- [ ] **Color contrast >= 4.5:1** (text vs background)
- [ ] **Focus states visible** (outline or highlight on focus)

### Documentation

- [ ] **Code comments** for complex logic
- [ ] **Javadoc** for backend methods (if backend changes)
- [ ] **README updated** with new features/endpoints
- [ ] **API documentation** (Swagger/OpenAPI generated or manual)
- [ ] **Deployment steps documented** (if infrastructure changes)

### Git & Code Review

- [ ] **Commit message follows convention**: `feat|fix|refactor(scope): description #TASKID`
- [ ] **Branch name follows convention**: `feature/T1-1-user-profile-save`
- [ ] **Pull request description clear** (what changed, why, testing)
- [ ] **Code reviewed by 2 people** minimum
- [ ] **All review comments addressed**
- [ ] **Approved and merged** to develop/main

### Deployment Readiness

- [ ] **Database migrations run** (if schema changed)
- [ ] **No breaking API changes** (versioned if needed)
- [ ] **Environment variables documented** (.env.example)
- [ ] **Rollback plan documented** (if something goes wrong)
- [ ] **On-call runbook created** (for support team)

---

## 🔧 DEBUGGING & TROUBLESHOOTING

### Common Issues & Solutions

**Issue: 401 Unauthorized on API calls**
```bash
# Check token in localStorage
localStorage.getItem('access_token')

# Check token expiration
jwt.io (paste token here)

# Test backend endpoint directly
curl -X GET http://localhost:8080/api/v0/auth/currentuser \
  -H "Authorization: Bearer <TOKEN>"
```

**Issue: CORS error in browser console**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/v0/batches' 
from origin 'http://localhost:4200' has been blocked by CORS policy
```
Solution: Verify backend SecurityConfig has `@CrossOrigin` or `.cors()` configured.

**Issue: Batch quantity not updating after transaction**
```bash
# Check if update is actually persisted in DB
curl -X GET http://localhost:8080/api/v0/batches/1

# Check audit log to see if transaction was recorded
curl -X GET http://localhost:8080/api/v0/audit-logs?tableName=batches
```

**Issue: Spinner stuck (infinite loading)**
- Check Network tab for failed API call
- Check browser console for JavaScript errors
- Verify component has proper finalize() to hide spinner on error

---

## 📚 QUICK API REFERENCE

### Authentication

```bash
# Login
POST /api/v0/auth/login
Body: { "username": "pharmacist_1", "password": "..." }
Response: { "token": "eyJ...", "tokenType": "Bearer" }

# Get Current User
GET /api/v0/auth/currentuser
Header: Authorization: Bearer <TOKEN>
Response: { "id": 1, "username": "pharmacist_1", "role": "PHARMACIAN", "email": "..." }
```

### Products

```bash
# Search Products
GET /api/v0/products/search?key=Saline
Response: [ { "id": 1, "name": "Saline Solution", ... } ]
```

### Batches

```bash
# Get Batch by ID
GET /api/v0/batches/1
Response: { "id": 1, "lotNumber": "LOT-001", "quantity": 100, ... }

# Get Expiration Alerts (< 30 days)
GET /api/v0/batches/alerts/30
Response: [ { "id": 1, "daysUntilExpiration": 15, ... } ]

# Quarantine Batch
PUT /api/v0/batches/1/quarantine?reason=Contamination
Response: { "id": 1, "status": "QUARANTINE", ... }
```

### Transactions

```bash
# Record Transaction
POST /api/v0/transactions
Body: { "type": "OUT", "batchId": 1, "quantity": 50, "reason": "Daily dispensing" }
Response: { "id": 1, "type": "OUT", ... }

# Get Recent Transactions
GET /api/v0/transactions?limit=10
Response: [ { "id": 1, "type": "OUT", ... } ]
```

### Users

```bash
# Update User
PUT /api/v0/users
Body: { "email": "new@hospital.local", "password": "newpass123" }
Response: { "id": 1, "email": "new@hospital.local", ... }
```

---

## 📋 APPENDIX: Test Data Setup

### Seed Database (if needed)

```sql
-- Users
INSERT INTO app_user (username, email, role, password, active)
VALUES ('pharmacist_1', 'pharma1@hospital.local', 'PHARMACIAN', 
        '$2a$10$slYQmyNdGzin7olVN3p5Be7DZCJqcWWNe7Ci/NXZhUdLaIqN7ZCJS', true);

-- Products
INSERT INTO products (name, nsn_code, description, minimum_stock_level, active)
VALUES ('Saline Solution', 'NSN-001', '0.9% Sodium Chloride', 50, true);

-- Batches
INSERT INTO batches (product_id, lot_number, quantity, expiration_date, location, status)
VALUES (1, 'LOT-2024-001', 100, '2025-06-30', 'Cabinet A', 'ACTIVE');

-- Transactions
INSERT INTO transactions (user_id, product_id, batch_id, type, quantity, reason, created_at)
VALUES (1, 1, 1, 'IN', 100, 'Initial stock', NOW());
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Before Production Deployment

- [ ] All Phase 1 tasks completed and merged
- [ ] All smoke tests passing
- [ ] UAT sign-off from hospital
- [ ] Security audit completed
- [ ] Performance load test passed (100 concurrent users)
- [ ] Database backups tested (restore works)
- [ ] Runbook created for on-call team
- [ ] Rollback plan documented
- [ ] Communication sent to hospital (downtime window, etc.)

### Deployment Steps

```bash
# 1. Tag release
git tag -a v0.1.0 -m "MVP release"
git push origin v0.1.0

# 2. Build backend
cd api && ./mvnw clean package -DskipTests

# 3. Build frontend
cd ../frontend && npm run build

# 4. Deploy (example: Docker)
docker-compose -f docker-compose.prod.yml up -d

# 5. Smoke tests
curl http://production.hospital.local/api/v0/auth/currentuser

# 6. Notify team
Slack: "@channel MVP deployment complete. Testing now..."
```

---

## 📞 SUPPORT & ESCALATION

**Critical Issues (P1):**
- Contact: Backend Lead + Frontend Lead
- Response time: 30 minutes
- Examples: System down, data loss, security breach

**Important Issues (P2):**
- Contact: Task Owner
- Response time: 2 hours
- Examples: Feature not working, wrong data shown

**Minor Issues (P3):**
- Contact: Task Owner or QA
- Response time: Next business day
- Examples: Typo, UI alignment, color

---

**Document Version**: 1.0  
**Last Updated**: 2026-05-22  
**Status**: READY FOR IMPLEMENTATION  
**Next Review**: 2026-05-29 (End of Week 1)
