import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-gbm',
  templateUrl: './gbm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GbmComponent extends BasePageComponent {}
