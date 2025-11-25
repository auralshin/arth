import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-momentum',
  templateUrl: './momentum.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MomentumComponent extends BasePageComponent {}
