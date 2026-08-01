import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-greeks',
  templateUrl: './greeks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GreeksComponent extends BasePageComponent {}
