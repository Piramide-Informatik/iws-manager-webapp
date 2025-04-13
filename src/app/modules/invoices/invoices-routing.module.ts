import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListInvoicesComponent } from './components/list-invoices-contracts/list-invoices.component';

const routes: Routes = [{ path: '', component: ListInvoicesComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoicesRoutingModule {}
