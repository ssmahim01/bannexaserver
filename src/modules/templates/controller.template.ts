import { Request, Response } from "express";
import * as templateService from "./service.template";

export const getSingleParam = (param: string | string[]) =>
  Array.isArray(param) ? param[0] : param;

export async function getTemplateController(req: Request, res: Response) {
  const slug = getSingleParam(req.params.slug);

  const template = await templateService.getTemplateBySlug(slug);
  if (!template) {
    return res.status(404).json({ error: "Template not found" });
  }

  return res.json({ success: true, data: template });
}

export async function createTemplateController(req: Request, res: Response) {
  const user = req.user!;
  const template = await templateService.createTemplate(req.body, user.id);
  return res.status(201).json({ success: true, data: template });
}
