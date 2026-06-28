"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const model_post_1 = require("../src/modules/posts/model.post");
function fixPostsWithNaN() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log("🔧 Starting database cleanup for NaN values...");
            // Connect to database
            yield mongoose_1.default.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/bannexa");
            console.log("✅ Connected to database");
            // Find all posts
            const posts = yield model_post_1.Post.find({});
            console.log(`📊 Found ${posts.length} posts to check`);
            let fixedCount = 0;
            for (const post of posts) {
                let needsUpdate = false;
                // Fix likes
                if (!post.likes) {
                    post.likes = { count: 0, users: [] };
                    needsUpdate = true;
                }
                else {
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
                }
                else {
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
                    yield post.save();
                    fixedCount++;
                    console.log(`✅ Fixed post: ${post._id} - ${post.caption}`);
                }
            }
            console.log(`\n✨ Cleanup complete!`);
            console.log(`📊 Total posts: ${posts.length}`);
            console.log(`🔧 Fixed posts: ${fixedCount}`);
            console.log(`✅ Healthy posts: ${posts.length - fixedCount}`);
            yield mongoose_1.default.disconnect();
            console.log("👋 Disconnected from database");
            process.exit(0);
        }
        catch (error) {
            console.error("❌ Error during cleanup:", error);
            process.exit(1);
        }
    });
}
// Run the cleanup
fixPostsWithNaN();
