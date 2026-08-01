import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-corporate-actions',
  templateUrl: './corporate-actions.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CorporateActionsComponent extends BasePageComponent {}
