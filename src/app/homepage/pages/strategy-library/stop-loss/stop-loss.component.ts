import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-stop-loss',
  templateUrl: './stop-loss.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StopLossComponent extends BasePageComponent {}
