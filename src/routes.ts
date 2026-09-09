import { Router } from "express";
import { UserRoutes } from "./modules/users/route.user";
import { PostRoutes } from "./modules/posts/route.post";
import { CategoryRoutes } from "./modules/categories/route.category";
import { TemplateRoutes } from "./modules/templates/route.template";
import { OrderRoutes } from "./modules/orders/route.order";
import { PaymentMethodRoutes } from "./modules/payment-method/route.method";
import { AIRoutes } from "./modules/ai-images/route.ai-image";

const router = Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/posts",
    route: PostRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/templates",
    route: TemplateRoutes,
  },
  {
    path: "/orders",
    route: OrderRoutes,
  },
  {
    path: "/payment-methods",
    route: PaymentMethodRoutes,
  },
  { path: "/ai-images", route: AIRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
