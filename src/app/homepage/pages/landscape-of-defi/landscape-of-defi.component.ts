import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-landscape-of-defi',
  templateUrl: './landscape-of-defi.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandscapeOfDefiComponent extends BasePageComponent {}
