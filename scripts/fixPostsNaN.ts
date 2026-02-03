import mongoose from "mongoose";
import { Post } from "../src/modules/posts/model.post";

async function fixPostsWithNaN() {
  try {
    console.log("🔧 Starting database cleanup for NaN values...");

    // Connect to database
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/bannexa",
    );
    console.log("✅ Connected to database");

    // Find all posts
    const posts = await Post.find({});
    console.log(`📊 Found ${posts.length} posts to check`);

    let fixedCount = 0;

    for (const post of posts) {
      let needsUpdate = false;

      // Fix likes
      if (!post.likes) {
        post.likes = { count: 0, users: [] };
        needsUpdate = true;
      } else {
        if (typeof post.likes.count !== "number" || isNaN(post.likes.count)) {
          post.likes.count = 0;
          needsUpdate = true;
        }
        if (!Array.isArray(post.likes.users)) {
          post.likes.users = [];
          needsUpdate = true;
        }
      }

      // Fix shares
      if (!post.shares) {
        post.shares = { count: 0, users: [] };
        needsUpdate = true;
      } else {
        if (typeof post.shares.count !== "number" || isNaN(post.shares.count)) {
          post.shares.count = 0;
          needsUpdate = true;
        }
        if (!Array.isArray(post.shares.users)) {
          post.shares.users = [];
          needsUpdate = true;
        }
      }

      // Fix likedBy array
      if (!Array.isArray(post.likedBy)) {
        post.likedBy = [];
        needsUpdate = true;
      }

      // Fix sharedBy array
      if (!Array.isArray(post.sharedBy)) {
        post.sharedBy = [];
        needsUpdate = true;
      }

      // Sync likes.count with likedBy length
      if (post.likes.count !== post.likedBy.length) {
        post.likes.count = post.likedBy.length;
        post.likes.users = post.likedBy;
        needsUpdate = true;
      }

      // Sync shares.count with sharedBy length
      if (post.shares.count !== post.sharedBy.length) {
        post.shares.count = post.sharedBy.length;
        post.shares.users = post.sharedBy;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await post.save();
        fixedCount++;
        console.log(`✅ Fixed post: ${post._id} - ${post.caption}`);
      }
    }

    console.log(`\n✨ Cleanup complete!`);
    console.log(`📊 Total posts: ${posts.length}`);
    console.log(`🔧 Fixed posts: ${fixedCount}`);
    console.log(`✅ Healthy posts: ${posts.length - fixedCount}`);

    await mongoose.disconnect();
    console.log("👋 Disconnected from database");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    process.exit(1);
  }
}

// Run the cleanup
fixPostsWithNaN();
