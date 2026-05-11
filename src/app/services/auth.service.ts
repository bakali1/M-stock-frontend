import { computed, inject, Injectable, signal } from "@angular/core";
import { map, Observable, tap } from "rxjs";
import { ApiService } from "./api.service";
import { UserRole } from "../models/user.model";

export interface AuthResponse {
    token: string;
    tokenType: string;
}

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthUser {
    email?: string;
    role?: UserRole;
    username?: string;
}

interface JwtClaims {
    username?: string;
    role?: UserRole;
    email?: string;
    exp?: number;
    iat?: number;
}

@Injectable({
    providedIn: "root"
})
export class AuthService {
    private api = inject(ApiService);
    private storageKey = "mstock.auth.token";
    private token = signal<string | null>(this.readToken());

    user = computed<AuthUser | null>(() => this.getUserFromToken());
    isAuthenticated = computed(() => this.isTokenValid(this.token()));

    login(credentials: LoginCredentials): Observable<AuthResponse> {
        return this.api.post<AuthResponse>("/auth/login", credentials).pipe(
            map(response => response.data),
            tap(auth => this.setToken(auth.token))
        );
    }

    register(user: { username: string; password: string; email: string; role?: UserRole }): Observable<AuthResponse> {
        return this.api.post<AuthResponse>("/auth/register", user).pipe(
            map(response => response.data),
            tap(auth => this.setToken(auth.token))
        );
    }

    logout() {
        this.clearToken();
    }

    getAccessToken(): string | null {
        return this.token();
    }

    private setToken(token: string) {
        this.token.set(token);
        localStorage.setItem(this.storageKey, token);
    }

    private clearToken() {
        this.token.set(null);
        localStorage.removeItem(this.storageKey);
    }

    private readToken(): string | null {
        return localStorage.getItem(this.storageKey);
    }

    private isTokenValid(token: string | null): boolean {
        if (!token) {
            return false;
        }
        const claims = this.parseClaims(token);
        if (!claims?.exp) {
            return true;
        }
        const expiresAtMs = claims.exp * 1000;
        return Date.now() < expiresAtMs;
    }

    private getUserFromToken(): AuthUser | null {
        const token = this.token();
        if (!token) {
            return null;
        }
        const claims = this.parseClaims(token);
        if (!claims) {
            return null;
        }
        return {
            email: claims.email,
            role: claims.role,
            username: claims.username
        };
    }

    private parseClaims(token: string): JwtClaims | null {
        const parts = token.split(".");
        if (parts.length !== 3) {
            return null;
        }
        try {
            const payload = this.decodeBase64Url(parts[1]);
            return JSON.parse(payload) as JwtClaims;
        } catch {
            return null;
        }
    }

    private decodeBase64Url(value: string): string {
        const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
        return atob(padded);
    }
}
