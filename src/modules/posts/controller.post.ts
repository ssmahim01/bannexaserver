import { Request, Response } from "express";
import * as postService from "./service.post";
import User from "../users/model.user";
import { Post } from "./model.post";
import { Types } from "mongoose";

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

export async function getMyPostsController(req: Request, res: Response) {
  const userId = req.user._id;

  const posts = await postService.getPostsByUser(userId);

  res.json({ success: true, data: posts });
}

export async function updatePostController(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  const post = await postService.updatePost(id, req.body, req.user!);
  res.json({ success: true, data: post });
}

export async function deletePostController(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

  await postService.deletePost(id, req.user!);
  res.json({ success: true });
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
  const post = await postService.createPost(req.body, user._id);

  return res.status(201).json({ success: true, data: post });
}

export async function toggleLikePostController(req: Request, res: Response) {
  try {
    // Check authentication
    if (!req.user || !req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = req.user._id;
    const postId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    // Find post
    const post = await Post.findById({ _id: postId });
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Initialize likedBy array if not exists
    if (!post.likedBy) {
      post.likedBy = [];
    }

    // Initialize likes object if not exists
    if (!post.likes) {
      post.likes = { count: 0, users: [] };
    }

    // Ensure count is valid number (FIX FOR NaN ERROR)
    if (typeof post.likes.count !== "number" || isNaN(post.likes.count)) {
      post.likes.count = 0;
    }

    // Check if already liked
    const alreadyLiked = post.likedBy.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyLiked) {
      // Unlike
      post.likedBy = post.likedBy.filter(
        (id) => id.toString() !== userId.toString(),
      );
      // Prevent negative count
      post.likes.count = Math.max(0, post.likes.count - 1);
    } else {
      // Like
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      post.likedBy.push(new Types.ObjectId(userId));

      post.likes.count = post.likes.count + 1;
    }

    // Sync likes.users with likedBy (keep them consistent)
    post.likes.users = post.likedBy;
    post.likedBy = post.likedBy.filter(Boolean);

    // Save post
    await post.save();

    return res.json({
      success: true,
      liked: !alreadyLiked,
      likes: {
        count: post.likes.count,
        users: post.likes.users,
      },
    });
  } catch (error) {
    console.error("❌ Toggle Like Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle like",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}

export async function sharePostController(req: Request, res: Response) {
  try {
    // Check authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = req.user._id;
    const postId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    // Find post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    // Initialize sharedBy array if not exists
    if (!post.sharedBy) {
      post.sharedBy = [];
    }

    // Initialize shares object if not exists
    if (!post.shares) {
      post.shares = { count: 0, users: [] };
    }

    // Ensure count is valid number (FIX FOR NaN ERROR)
    if (typeof post.shares.count !== "number" || isNaN(post.shares.count)) {
      post.shares.count = 0;
    }

    // Check if already shared
    const alreadyShared = post.sharedBy.some(
      (id) => id.toString() === userId.toString(),
    );

    if (alreadyShared) {
      // Already shared, just return current state
      return res.json({
        success: true,
        shared: true,
        shares: {
          count: post.shares.count,
          users: post.shares.users,
        },
        message: "Already shared",
      });
    }

    // Add share
    post.sharedBy.push(new Types.ObjectId(userId));
    post.shares.count = post.shares.count + 1;

    // Sync shares.users with sharedBy
    post.shares.users = post.sharedBy;

    // Save post
    await post.save();

    return res.json({
      success: true,
      shared: true,
      shares: {
        count: post.shares.count,
        users: post.shares.users,
      },
    });
  } catch (error) {
    console.error("❌ Share Post Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to share post",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}

export async function getSavedPostsController(req: Request, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const user = await User.findById(req.user._id)
      .populate({
        path: "savedPosts",
        match: { isActive: true },
        populate: {
          path: "category",
          select: "slug name nameEn",
        },
      });

    return res.json({
      success: true,
      data: user?.savedPosts || [],
    });
  } catch (error) {
    console.error("❌ Get Saved Posts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch saved posts",
    });
  }
}

export async function toggleSavePostController(req: Request, res: Response) {
  try {
    // Check authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const userId = req.user._id;
    const postId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Initialize savedPosts array if not exists
    if (!user.savedPosts) {
      user.savedPosts = [];
    }

    // Check if already saved
    const alreadySaved = user.savedPosts.some(
      (id) => id.toString() === postId.toString(),
    );

    if (alreadySaved) {
      // Unsave: Remove from savedPosts (FIXED BUG - was comparing with userId)
      user.savedPosts = user.savedPosts.filter(
        (id) => id.toString() !== postId.toString(),
      );
    } else {
      // Save: Add to savedPosts
      user.savedPosts.push(new Types.ObjectId(postId));
    }

    // Save user
    await user.save();

    return res.json({
      success: true,
      saved: !alreadySaved,
      savedPosts: user.savedPosts,
    });
  } catch (error) {
    console.error("❌ Toggle Save Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle save",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
}
