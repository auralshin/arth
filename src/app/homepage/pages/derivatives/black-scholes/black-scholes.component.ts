import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-black-scholes',
  templateUrl: './black-scholes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlackScholesComponent extends BasePageComponent {}
