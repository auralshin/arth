import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-derivatives',
  templateUrl: './derivatives.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DerivativesComponent extends BasePageComponent {}
