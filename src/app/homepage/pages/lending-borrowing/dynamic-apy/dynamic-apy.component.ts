import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-dynamic-apy',
  templateUrl: './dynamic-apy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicApyComponent extends BasePageComponent {}
