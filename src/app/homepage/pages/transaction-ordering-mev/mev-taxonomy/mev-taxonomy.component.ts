import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-mev-taxonomy',
  templateUrl: './mev-taxonomy.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MevTaxonomyComponent extends BasePageComponent {}
