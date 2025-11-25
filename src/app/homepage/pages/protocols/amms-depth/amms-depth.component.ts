import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-amms-depth',
  templateUrl: './amms-depth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmmsDepthComponent extends BasePageComponent {}
