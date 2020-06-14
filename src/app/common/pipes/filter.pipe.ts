import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter'
})
export class FilterPipe implements PipeTransform {

  transform(items: any[], propName?: any): any {
    return items.filter(item => item[propName]);
  }

}
