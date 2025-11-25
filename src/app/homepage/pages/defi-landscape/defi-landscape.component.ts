import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-defi-landscape',
  templateUrl: './defi-landscape.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefiLandscapeComponent extends BasePageComponent {}
