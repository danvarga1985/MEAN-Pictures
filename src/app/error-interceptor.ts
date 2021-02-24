
import { HttpErrorResponse, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { BehaviorSubject, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AuthService } from "./auth/auth.service";
import { ErrorComponent } from "./error/error.component";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private dialog: MatDialog, private authService: AuthService) { };

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.error.message) {
          this.authService.emitErrorMessage(error.error.message);
        }

        this.dialog.open(ErrorComponent);

        return throwError(error);
      })
    );

  };

}

