import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-how-blocks-form',
  templateUrl: './how-blocks-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowBlocksFormComponent extends BasePageComponent {}
