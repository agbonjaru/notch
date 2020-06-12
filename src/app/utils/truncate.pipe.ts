import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string, args: string[]) : string {
    if(value == null || value == undefined) return value
    var values = value.replace(/<\/?[^>]+(>|$)/g, "");
    const limit = args.length > 0 ? parseInt(args[0], 10) : 20;
    const trail = args.length > 1 ? args[1] : '...';
    return values.length > limit ? values.substring(0, limit) + trail : values;
  }
  //.replace(/<(?:.|\n)*?>/gm, '');

}
