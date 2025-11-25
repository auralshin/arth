import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-frontrunning',
  templateUrl: './frontrunning.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FrontrunningComponent extends BasePageComponent {}
