import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isUserAuthenticated = false;
  private authListenerSubscription: Subscription;

  constructor(private authService: AuthService) { }

  onLogout(): void {
   this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authListenerSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.authListenerSubscription = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.isUserAuthenticated = isAuthenticated;
      });
  }

}
