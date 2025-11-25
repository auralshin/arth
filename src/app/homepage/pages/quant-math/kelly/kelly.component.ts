import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-kelly',
  templateUrl: './kelly.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KellyComponent extends BasePageComponent {}
