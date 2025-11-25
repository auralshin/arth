import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-advanced-topics',
  templateUrl: './advanced-topics.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdvancedTopicsComponent extends BasePageComponent {}
