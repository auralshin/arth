import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-checklists',
  templateUrl: './checklists.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChecklistsComponent extends BasePageComponent {}
