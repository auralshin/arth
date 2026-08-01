import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-numerical-schemes',
  templateUrl: './numerical-schemes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumericalSchemesComponent extends BasePageComponent {}
