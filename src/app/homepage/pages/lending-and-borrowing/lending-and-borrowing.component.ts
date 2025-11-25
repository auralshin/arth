import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasePageComponent } from '@base-page';

@Component({
  selector: 'app-lending-and-borrowing',
  templateUrl: './lending-and-borrowing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LendingAndBorrowingComponent extends BasePageComponent {}
