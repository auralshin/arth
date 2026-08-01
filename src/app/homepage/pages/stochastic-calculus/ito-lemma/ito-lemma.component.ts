import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-ito-lemma',
  templateUrl: './ito-lemma.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItoLemmaComponent extends BasePageComponent {}
