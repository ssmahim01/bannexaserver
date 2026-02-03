import { Router } from "express";
import { UserRoutes } from "./modules/users/route.user";
import { PostRoutes } from "./modules/posts/route.post";
import { CategoryRoutes } from "./modules/categories/route.category";
import { TemplateRoutes } from "./modules/templates/route.template";

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
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
