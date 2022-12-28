import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'standaloneApi',
  standalone: true
})
export class StandaloneApiPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
