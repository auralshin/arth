import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-how-to-read',
  templateUrl: './how-to-read.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowToReadComponent extends BasePageComponent {}
