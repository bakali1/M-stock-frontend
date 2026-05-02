import { inject, Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { User } from "../models/user.model";
import { map, Observable } from "rxjs";

@Injectable({
    providedIn:"root"
})
export class AuthService{
    private api = inject(ApiService);

    login(user: Partial<User>):Observable<User> {
        return this.api.post<User>("/auth/", user).pipe(
            map(respose => respose.data)
        );
    }
    regester(user: Partial<User>): Observable<User> {
        return this.api.post<User>("/auth/register", user).pipe(
            map(respose => respose.data)
        );
    }
    currentUser(): Partial<User> {
        const user = {"id":1};
        return user;
    }
}