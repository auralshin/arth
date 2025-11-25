import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-numerical-methods',
  templateUrl: './numerical-methods.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericalMethodsComponent extends BasePageComponent {}
