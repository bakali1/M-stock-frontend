# M-Stock Implementation Notes

## PostgreSQL-Specific Guidance

### JSONB for Audit Logs

PostgreSQL **JSONB** type allows efficient storage and querying of audit log old/new values.

#### Current Approach (TEXT)
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(50),
    table_name VARCHAR(50),
    old_value TEXT,           -- Raw JSON string
    new_value TEXT,           -- Raw JSON string
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Phase 2: JSONB Optimization
```sql
ALTER TABLE audit_logs
ALTER COLUMN old_value TYPE JSONB USING old_value::jsonb,
ALTER COLUMN new_value TYPE JSONB USING new_value::jsonb;

-- Fast queries on nested fields
SELECT * FROM audit_logs 
WHERE old_value -> 'quantity' != new_value -> 'quantity';
```

**Benefit**: Native indexing, GIN indexes for fast search, smaller storage.

### Connection Pooling

Spring Boot uses **HikariCP** by default. PostgreSQL-specific tuning in `application.yaml`:

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
      connection-timeout: 20000
      idle-timeout: 300000
      max-lifetime: 1200000
```

### Indexes for MVP

Add these indexes in `init.sql` or via flyway migration (Phase 2):

```sql
-- Search optimization
CREATE INDEX idx_batches_lot_number ON batches(lot_number);
CREATE INDEX idx_batches_product_id ON batches(product_id);
CREATE INDEX idx_batches_expiration_date ON batches(expiration_date);

-- Audit trail fast queries
CREATE INDEX idx_audit_logs_username ON audit_logs(username);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);

-- PAR levels lookups
CREATE INDEX idx_products_nsn_code ON products(nsn_code);
```

---

## Authentication & Authorization

### CAC Header Validation

**Assumption**: Hospital proxy injects `X-Forwarded-User` header with CAC identifier (e.g., `john.doe@mil.org`).

#### Spring Security Configuration (Pseudo-code)

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/**").authenticated()
            .anyRequest().permitAll()
        )
        .exceptionHandling(ex -> ex
            .authenticationEntryPoint(new CAC401EntryPoint())
        );
        return http.build();
    }
}

@Component
public class CAC401EntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest req, HttpServletResponse res, 
                        AuthenticationException exc) throws IOException {
        res.setStatus(401);
        res.getWriter().write("{\"error\": \"CAC header X-Forwarded-User missing or invalid\"}");
    }
}
```

#### Custom UserDetailsService (Read CAC header)

```java
@Service
public class CACUserDetailsService implements UserDetailsService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException(username));
        
        return User.builder()
            .username(user.getUsername())
            .password("")  // CAC doesn't use password
            .authorities(parseRoles(user.getRole()))
            .build();
    }
    
    private Collection<GrantedAuthority> parseRoles(String roleStr) {
        return Arrays.asList(new SimpleGrantedAuthority("ROLE_" + roleStr));
    }
}
```

#### Filter to Extract CAC Header

```java
@Component
public class CACAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, 
                                   FilterChain chain) throws ServletException, IOException {
        String cacUser = req.getHeader("X-Forwarded-User");
        
        if (cacUser != null && !cacUser.isEmpty()) {
            // Create authentication token
            UsernamePasswordAuthenticationToken token = 
                new UsernamePasswordAuthenticationToken(cacUser, null, new ArrayList<>());
            SecurityContextHolder.getContext().setAuthentication(token);
        }
        
        chain.doFilter(req, res);
    }
}
```

### User Seeding (MVP Approach — Manual)

**Current (S1)**: Admin manually creates users via Spring Data REST or admin panel.

**Future (Phase 2)**:
- CSV bulk import endpoint
- LDAP sync if hospital has LDAP

#### Manual User Creation SQL

```sql
INSERT INTO users (username, role) VALUES
('john.doe@mil.org', 'CLERK'),
('jane.smith@mil.org', 'OFFICER'),
('supply.sergeant@mil.org', 'OFFICER');
```

---

## Role-Based Access Control (RBAC)

### Roles & Permissions Matrix

| Role | Lookup | Withdraw | Receive | PAR View | Audit View | Reporting |
|------|--------|----------|---------|----------|------------|-----------|
| VIEWER | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| CLERK | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| OFFICER | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Spring Security Annotations

```java
@RestController
@RequestMapping("/api")
public class TransactionController {
    
    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('VIEWER', 'CLERK', 'OFFICER', 'ADMIN')")
    public List<Transaction> listTransactions() { ... }
    
    @PostMapping("/transactions/withdraw")
    @PreAuthorize("hasAnyRole('CLERK', 'ADMIN')")
    public ResponseEntity<?> withdraw(@RequestBody WithdrawRequest req) { ... }
    
    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyRole('OFFICER', 'ADMIN')")
    public List<AuditLog> viewAuditLogs() { ... }
}
```

---

## Audit Trail Implementation

### Automatic Logging via AOP

Use **AspectJ** to intercept all repository/controller calls:

```java
@Aspect
@Component
public class AuditAspect {
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Around("execution(* com.mstock.api.repositories.*.save(..))")
    public Object logSave(ProceedingJoinPoint pjp) throws Throwable {
        Object entity = pjp.getArgs()[0];
        Object result = pjp.proceed();
        
        AuditLog log = new AuditLog();
        log.setAction("CREATE");
        log.setTableName(entity.getClass().getSimpleName());
        log.setNewValue(toJson(result));
        log.setUsername(getCurrentUser());
        log.setCreatedAt(LocalDateTime.now());
        
        auditLogRepository.save(log);
        return result;
    }
    
    private String toJson(Object obj) {
        return new ObjectMapper().writeValueAsString(obj);
    }
    
    private String getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null ? auth.getName() : "SYSTEM";
    }
}
```

### 1-Year Rolling Retention + Monthly Archive

**MVP**: All logs kept in `audit_logs` table.

**Phase 2**: Implement archival:

```sql
-- Archive logs older than 1 year to `audit_logs_archive`
INSERT INTO audit_logs_archive
SELECT * FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';

DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '1 year';
```

---

## Transaction Reversal Policy

**MVP**: No reversals. Mistakes = new corrective transaction.

Example workflow:
1. Nurse withdraws 5 units of Item X by mistake.
2. ADMIN creates new transaction: +5 units of Item X (reason: "Correction for transaction #123").
3. Both appear in audit trail.

---

## Barcode Scanner Integration (Late Feature, S3+)

### Hardware Assumption
- USB barcode scanner acts as HID keyboard.
- Scans product NSN → Types it + presses Enter.

### Implementation

#### Angular Form (Withdraw Page)

```typescript
@Component({
  selector: 'app-withdraw',
  template: `
    <form (ngSubmit)="onWithdraw()">
      <input 
        type="text" 
        #barcodeInput 
        placeholder="Scan barcode or enter NSN..."
        (keyup.enter)="onBarcodeScanned($event)"
        autofocus
      />
      <input type="number" placeholder="Quantity" [(ngModel)]="quantity" />
      <button type="submit">Withdraw</button>
    </form>
  `
})
export class WithdrawComponent {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef;
  quantity = 1;
  
  ngAfterViewInit() {
    this.barcodeInput.nativeElement.focus();  // Auto-focus on load
  }
  
  onBarcodeScanned(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const barcode = input.value.trim();
    
    if (barcode.length > 0) {
      this.lookupProduct(barcode);  // Query API
    }
  }
  
  lookupProduct(nsn: string) {
    this.api.searchBatches({ nsn }).subscribe(results => {
      if (results.length > 0) {
        // Auto-populate form with first result
        this.selectedBatch = results[0];
      }
    });
  }
  
  onWithdraw() {
    // Submit transaction
  }
}
```

#### Backend Endpoint

```java
@GetMapping("/api/batches/search")
public List<Batch> searchBatches(
    @RequestParam(required = false) String nsn,
    @RequestParam(required = false) String lot) {
    
    if (nsn != null) {
        return batchRepository.findByProduct_NsnCodeContaining(nsn);
    }
    if (lot != null) {
        return batchRepository.findByLotNumberContaining(lot);
    }
    return new ArrayList<>();
}
```

**Manual NSN lookup option**: Form also accepts manual text entry if scanner fails.

---

## Database Migration Strategy

### Current (S1)
- Manual `init.sql` import on container startup.
- Dev uses `spring.jpa.hibernate.ddl-auto: update`.

### Phase 2: Flyway Migrations
Add versioned SQL migrations:

```
api/src/main/resources/db/migration/
  V1__create_initial_schema.sql
  V2__add_par_levels_table.sql
  V3__add_jsonb_audit_logs.sql
```

---

## Performance Tuning (S7–S8)

### Query Analysis
```sql
EXPLAIN ANALYZE SELECT * FROM batches WHERE expiration_date < NOW() + INTERVAL '30 days';
```

### Connection Pool Tuning
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 15  # Adjust based on load testing
      connection-timeout: 30000
```

### Batch Processing (Expiration CRON)
```java
@Scheduled(cron = "0 0 * * * *")  // Daily at midnight
public void checkExpirations() {
    List<Batch> expiring = batchRepository.findExpiringBatches(30);
    
    expiring.forEach(batch -> {
        AlertNotification alert = new AlertNotification();
        alert.setBatch(batch);
        alert.setSeverity("CRITICAL");
        auditLogService.log("EXPIRATION_ALERT", batch, null);
    });
}
```

---

## Security Checklist

- [x] CAC header validation required.
- [x] No plaintext passwords in logs.
- [x] SQL injection prevention via JPA parameterized queries.
- [x] XSS prevention: Angular auto-escapes by default.
- [x] CSRF: Spring Security enabled by default.
- [ ] HTTPS required in production (hospital-provided cert).
- [ ] Audit logs append-only (no delete/update).

---

## Deployment Checklist (Pre-Production)

1. **Backup**: Full database dump + test restore.
2. **Load test**: Simulate 1000 tx/day peak.
3. **Security scan**: OWASP Top 10 audit.
4. **User training**: 2-hour hands-on session per shift.
5. **Rollback plan**: Revert to previous version if critical bug found.
6. **Documentation**: README + troubleshooting guide for hospital IT.

