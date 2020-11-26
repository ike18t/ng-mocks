import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'MyPipe',
})
export class MyPipe implements PipeTransform {
  protected prefix = 'MyPipe:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'PipeWeDontWantToMimic',
})
export class PipeWeDontWantToMimicPipe implements PipeTransform {
  protected prefix = 'PipeWeDontWantToMimic:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'PipeWeWantToMimic',
})
export class PipeWeWantToMimicPipe implements PipeTransform {
  protected prefix = 'PipeWeWantToMimic:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'PipeWeWantToCustomize',
})
export class PipeWeWantToCustomize implements PipeTransform {
  protected prefix = 'PipeWeWantToCustomize:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}

@Pipe({
  name: 'PipeWeWantToRestore',
})
export class PipeWeWantToRestore implements PipeTransform {
  protected prefix = 'PipeWeWantToRestore:';

  public transform(value: any, ...args: any[]): any {
    return `${this.prefix}${value}:${args.length}`;
  }
}