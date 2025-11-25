import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-atr',
  templateUrl: './atr.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtrComponent extends BasePageComponent {}
