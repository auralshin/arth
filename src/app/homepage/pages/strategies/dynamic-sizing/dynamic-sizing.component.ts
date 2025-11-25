import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-dynamic-sizing',
  templateUrl: './dynamic-sizing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSizingComponent extends BasePageComponent {}
