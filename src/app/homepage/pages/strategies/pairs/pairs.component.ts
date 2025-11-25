import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-pairs',
  templateUrl: './pairs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PairsComponent extends BasePageComponent {}
