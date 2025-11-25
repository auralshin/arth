import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunityComponent extends BasePageComponent {}
