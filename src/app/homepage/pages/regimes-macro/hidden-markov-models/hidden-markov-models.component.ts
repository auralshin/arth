import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-hidden-markov-models',
  templateUrl: './hidden-markov-models.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HiddenMarkovModelsComponent extends BasePageComponent {}
