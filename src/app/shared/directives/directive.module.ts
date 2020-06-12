import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DisableControlDirective } from './disableControl.directive';

@NgModule({
  declarations: [DisableControlDirective],
  imports: [CommonModule],
  exports: [DisableControlDirective],
})
export class DirectiveModule {}
