import { Request, Response, NextFunction } from "express";

export const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  const result = schema.safeParse({ body: req.body, params: req.params, query: req.query });
  if (!result.success) return res.status(400).json({ errors: result.error.format() });

  // Instead of overwriting req.body/params/query (some environments make these getters),
  // attach parsed data at req.validated to avoid "Cannot set property query" error.
   (req as any).parsedParams = result.data.params;
  (req as any).parsedQuery = result.data.query;
  next();
};