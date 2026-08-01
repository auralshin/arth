import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-garch',
  templateUrl: './garch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GarchComponent extends BasePageComponent {}
