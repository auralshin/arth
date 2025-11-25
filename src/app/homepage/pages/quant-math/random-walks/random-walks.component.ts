import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-random-walks',
  templateUrl: './random-walks.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RandomWalksComponent extends BasePageComponent {}
