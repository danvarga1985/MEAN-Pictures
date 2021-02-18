import { AbstractControl } from "@angular/forms";
import { Observable, Observer, of} from "rxjs";

// Async validator - returns null if valid - object otherwise
// '[key: string]' - dynamic property name: any property that's a string, the name doesn't matter
export const mimeType = (
  control: AbstractControl):
  Promise<{ [key: string]: any }>
  | Observable<{ [key: string]: any }> => {

  if (typeof (control.value) === 'string') {
    return of(null);
  }
  const file = control.value as File;
  const fileReader = new FileReader();
  const frObs = new Observable((observer: Observer<{ [key: string]: any }>) => {
    // Listen to the fileReader's 'loadend' event. (fired when the file-read has completed)
    fileReader.addEventListener('loadend', () => {
      /*
      a. 'Uint8Array' let us look into the file and the metadata, enabling the parsing of the mime-type. Optimized array
          to store 9-bit unsigned integers. Elements are stored in an 'ArrayBuffer' object.
      b. 'subarray(0, 4)' contains the mime-type
      */
      const arr = new Uint8Array(fileReader.result as ArrayBuffer).subarray(0, 4);
      let header = '';
      let isValid = false;

      for (let i = 0; i < arr.length; i++) {
        // conversion to hexadecimal string
        header += arr[i].toString(16);
      }

      switch (header) {
        // .png & .jpg, .jpeg values
        case "89504e47":
          isValid = true;
          break;
        case "ffd8ffe0":
        case "ffd8ffe1":
        case "ffd8ffe2":
        case "ffd8ffe3":
        case "ffd8ffe8":
          isValid = true;
          break;
        default:
          isValid = false; // Or you can use the blob.type as fallback
          break;
      }

      if (isValid) {
        observer.next(null);
      } else {
        observer.next({ invalidMimeType: true });
      }

      observer.complete();

    });

    // Reading as ArrayBuffer gives access to the mime-type (e.g. 'image/png')
    fileReader.readAsArrayBuffer(file);
  });

  return frObs;
};
