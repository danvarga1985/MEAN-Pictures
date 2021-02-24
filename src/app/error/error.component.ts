import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { ErrorInterceptor } from '../error-interceptor';


@Component({
  // selector: 'app-error',
  templateUrl: '../error/error.component.html',
  styleUrls: ['../error/error.component.css']
})
export class ErrorComponent implements OnInit, OnDestroy {
  message: string;
  errorMessageSubscription: Subscription;

  constructor(public authService: AuthService) { };

  ngOnDestroy(): void {
    this.errorMessageSubscription.unsubscribe();
  };

  ngOnInit(): void {
    this.errorMessageSubscription = this.authService.getInterceptorStreamListener$().subscribe(mes => {
      this.message = mes;
    })
  };


}
