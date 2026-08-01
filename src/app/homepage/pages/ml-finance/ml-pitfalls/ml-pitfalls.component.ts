import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-ml-pitfalls',
  templateUrl: './ml-pitfalls.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MlPitfallsComponent extends BasePageComponent {}
