import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-binomial-trees',
  templateUrl: './binomial-trees.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BinomialTreesComponent extends BasePageComponent {}
