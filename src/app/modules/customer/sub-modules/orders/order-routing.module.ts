import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OrderDetailsComponent } from "./components/order-detail/order-details.component";
import { OrdersOverviewComponent } from "./components/orders-overview/orders-overview.component";

const routes: Routes = [
    {path: '', component: OrdersOverviewComponent},
    {path: 'orders-overview', component: OrdersOverviewComponent},
    {path: 'order-details', component: OrderDetailsComponent},
    {path: 'order-details/:orderId', component: OrderDetailsComponent}
]

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class OrderRountingModule {}