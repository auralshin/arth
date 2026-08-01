import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-labelling',
  templateUrl: './labelling.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LabellingComponent extends BasePageComponent {}
