import { HttpClient } from "@angular/common/http";
import { Injectable, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { AuthData } from "./auth-data.model";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  private authStatusListener = new ReplaySubject<boolean>(1);
  private isAuthenticated = false;
  private tokenTimer: NodeJS.Timer;

  constructor(private http: HttpClient, private router: Router) { }

  createUser(aEmail: string, aPassword: string): void {
    const authData: AuthData = { email: aEmail, password: aPassword };

    this.http.post('http://localhost:3000/api/user/signup', authData)
      .subscribe(response => {
        console.log(response);
      })
  }

  login(aEmail: string, aPassword: string): void {
    const authData: AuthData = { email: aEmail, password: aPassword };

    this.http.post<{ token: string, expiresIn: number }>('http://localhost:3000/api/user/login', authData)
      .subscribe(response => {
        const responseToken = response.token;
        this.token = responseToken;
        if (responseToken) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.authStatusListener.next(true);
          this.isAuthenticated = true;
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);

          console.log(expirationDate);

          this.saveAuthData(responseToken, expirationDate);
          this.navigateToRoot();
        }
      });
  }

  getToken(): string {
    return this.token;
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  logout(): void {
    this.token = null;
    this.authStatusListener.next(false);
    this.isAuthenticated = false;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.navigateToLogin();
  }

  private navigateToRoot(): void {
    this.router.navigate(['/']);
  }

  autoAuthUser(): void {
    const authInformation = this.getAuthData();

    if (!authInformation) {
      return;
    }

    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  private navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  private saveAuthData(token: string, expiratonDate: Date): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expiratonDate.toISOString());
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAuthData(): { token: string, expirationDate: Date } {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');

    if (!token || !expirationDate) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate)
    }
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);

    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
}
