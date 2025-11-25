import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-exception-filters',
  templateUrl: './exception-filters.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExceptionFiltersComponent extends BasePageComponent {}
