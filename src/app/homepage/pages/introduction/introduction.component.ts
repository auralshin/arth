import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-introduction',
  templateUrl: './introduction.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IntroductionComponent extends BasePageComponent {}
