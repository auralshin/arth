import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-mean-reversion',
  templateUrl: './mean-reversion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeanReversionComponent extends BasePageComponent {}
