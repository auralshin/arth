import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-how-to-navigate',
  templateUrl: './how-to-navigate.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowToNavigateComponent extends BasePageComponent {}
