import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthData } from "./auth-data.model";

const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string;
  private authStatusListener = new ReplaySubject<boolean>(1);
  private isAuthenticated = false;
  private tokenTimer: NodeJS.Timer;
  private userId: string;
  // Provide message for the error component - default error message
  private interceptorStream$ = new BehaviorSubject('An unknown error occurred');

  getInterceptorStreamListener$() {
    return this.interceptorStream$.asObservable();
  }

  emitErrorMessage(message: string): void {
    this.interceptorStream$.next(message);
  }

  constructor(private http: HttpClient, private router: Router) { }

  createUser(aEmail: string, aPassword: string) {
    const authData: AuthData = { email: aEmail, password: aPassword };

    this.http.post(BACKEND_URL + 'signup', authData)
      .subscribe(() => {
        this.navigateToLogin();
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  login(aEmail: string, aPassword: string): void {
    const authData: AuthData = { email: aEmail, password: aPassword };

    this.http.post<{ token: string, expiresIn: number, userId: string }>
      (BACKEND_URL + 'login', authData)
      .subscribe(response => {
        const responseToken = response.token;
        this.token = responseToken;
        if (responseToken) {
          const expiresInDuration = response.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.authStatusListener.next(true);
          this.isAuthenticated = true;
          this.userId = response.userId;
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);

          console.log(expirationDate);

          this.saveAuthData(responseToken, expirationDate, this.userId);
          this.navigateToRoot();
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  getToken(): string {
    return this.token;
  }

  getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  getUserId() {
    return this.userId;
  }

  logout(): void {
    this.token = null;
    this.authStatusListener.next(false);
    this.isAuthenticated = false;
    this.userId = null;
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.navigateToLogin();
  }

  private navigateToRoot(): void {
    this.router.navigate(['/']);
  }

  private navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
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
      this.userId = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
    }
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  private saveAuthData(token: string, expiratonDate: Date, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expiratonDate.toISOString());
    localStorage.setItem('userId', this.userId)
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData(): { token: string, expirationDate: Date, userId: string } {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expirationDate) {
      return;
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }

  private setAuthTimer(duration: number) {
    console.log('Setting timer: ' + duration);

    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
}
