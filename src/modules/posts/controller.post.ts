import { Request, Response } from "express";
import * as postService from "./service.post";

export async function getPostsController(req: Request, res: Response) {
  const filter: any = {};

  if (req.query.trending === "true") {
    filter.isTrending = true;
  }

  if (req.query.popular === "true") {
    filter.isPopular = true;
  }

  const posts = await postService.getAllPosts(filter);
  return res.json({ success: true, data: posts });
}

export async function getPostController(req: Request, res: Response) {
  const slug = Array.isArray(req.params.slug)
    ? req.params.slug[0]
    : req.params.slug;

  const post = await postService.getPostBySlug(slug);
  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  return res.json({ success: true, data: post });
}

export async function getPostsByCategoryController(
  req: Request,
  res: Response,
) {
  const slug = Array.isArray(req.params.slug)
    ? req.params.slug[0]
    : req.params.slug;

  const data = await postService.getPostsByCategory(slug);

  return res.json({ success: true, data });
}

export async function createPostController(req: Request, res: Response) {
  const user = req.user;
  const post = await postService.createPost(req.body, user.id);

  return res.status(201).json({ success: true, data: post });
}

export async function likePostController(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const post = await postService.likePost(id);
  return res.json({ success: true, data: post });
}

export async function sharePostController(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const post = await postService.sharePost(id);
  return res.json({ success: true, data: post });
}
