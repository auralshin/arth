import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-meta-labelling',
  templateUrl: './meta-labelling.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetaLabellingComponent extends BasePageComponent {}
