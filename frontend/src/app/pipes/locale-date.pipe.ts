import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'localeDate'
})
export class LocaleDatePipe implements PipeTransform {
  transform(value: Date | string | number): string {
    if (!value) return '';
    const date = new Date(value);
    return new Intl.DateTimeFormat(navigator.language).format(date);
  }
}