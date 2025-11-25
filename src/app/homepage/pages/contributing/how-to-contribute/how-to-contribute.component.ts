import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-how-to-contribute',
  templateUrl: './how-to-contribute.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowToContributeComponent extends BasePageComponent {}
