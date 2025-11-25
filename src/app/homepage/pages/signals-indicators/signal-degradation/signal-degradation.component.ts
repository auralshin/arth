import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-signal-degradation',
  templateUrl: './signal-degradation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalDegradationComponent extends BasePageComponent {}
