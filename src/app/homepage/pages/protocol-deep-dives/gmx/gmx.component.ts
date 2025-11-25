import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-gmx',
  templateUrl: './gmx.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GmxComponent extends BasePageComponent {}
