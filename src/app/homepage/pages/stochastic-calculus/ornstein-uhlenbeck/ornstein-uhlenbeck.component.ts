import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-ornstein-uhlenbeck',
  templateUrl: './ornstein-uhlenbeck.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrnsteinUhlenbeckComponent extends BasePageComponent {}
