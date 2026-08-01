import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-exotics',
  templateUrl: './exotics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExoticsComponent extends BasePageComponent {}
