import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-ema',
  templateUrl: './ema.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmaComponent extends BasePageComponent {}
