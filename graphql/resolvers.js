const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const validator = require("validator");
const Post = require("../models/post");
const User = require("../models/user");
const { clearImage } = require('../util/file')

module.exports = {
    createUser: async function ({ userInput }, req) {
        // const email = args.UserInput.email
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: "Email is not valid" });
        }
        if (
            validator.isEmpty(userInput.password) ||
            !validator.isLength(userInput.password, { min: 5 })
        ) {
            errors.push({ message: "Password too short!!" });
        }

        if (errors.length > 0) {
            const error = new Error("Invalid input.");
            error.code = 422;
            error.data = errors;
            throw error;
        }
        const existingUser = await User.findOne({ email: userInput.email });
        if (existingUser) {
            const error = new Error("User exists already!");
            throw error;
        }

        const hashedPw = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            password: hashedPw,
            name: userInput.name,
            email: userInput.email,
        });

        const createdUser = await user.save();

        return { ...createdUser._doc, _id: createdUser._id.toString() };
    },
    login: async function ({ email, password }) {
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error("User not found.");
            error.code = 401;
            throw error;
        }
        const isEqual = bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error("Password is incorrect.");
            error.code = 401; //401 Not authenticate
            throw error;
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email,
            },
            "thisismysecret",
            { expiresIn: "1h" }
        );

        return { token: token, userId: user._id.toString() };
    },
    createPost: async function ({ postInput }, req) {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }
        const errors = [];
        if (
            validator.isEmpty(postInput.title) ||
            !validator.isLength(postInput.title, { min: 5 })
        ) {
            errors.push({ message: "Title is invalid." });
        }
        if (
            validator.isEmpty(postInput.content) ||
            !validator.isLength(postInput.content, { min: 5 })
        ) {
            errors.push({ message: "Content is invalid." });
        }
        if (errors.length > 0) {
            const error = new Error("Invalid input.");
            error.data = errors;
            error.code = 422;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("Invalid user.");
            error.code = 401;
            throw error;
        }

        const post = new Post({
            imageUrl: postInput.imageUrl,
            content: postInput.content,
            title: postInput.title,
            creator: user,
        });

        const createdPost = await post.save();
        user.posts.push(createdPost);
        await user.save();

        return {
            ...createdPost,
            updatedAt: createdPost.updatedAt.toISOString(),
            ...createdPost._doc,
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
        };
    },
    posts: async function ({ page }, req) {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }
        if (!page) {
            page = 1;
        }
        const perPage = 2;

        const totalPosts = await Post.find().countDocuments();
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .limit(perPage)
            .skip((page - 1) * perPage)
            .populate("creator");

        return {
            posts: posts.map(p => {
                return {
                    ...p._doc,
                    _id: p._id.toString(),
                    createdAt: p.createdAt.toISOString(),
                    updatedAt: p.updatedAt.toISOString()
                }
            }), totalPosts: totalPosts
        };
    },
    post: async function ({ id }, req) {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id).populate('creator');
        if (!post) {
            const error = new Error("No post found!");
            error.code = 404;
            throw error;
        }

        return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString()
        }
    },
    updatePost: async function ({ id, postInput }, req) {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id).populate('creator');
        if (!post) {
            const error = new Error("No post found!");
            error.code = 404;
            throw error;
        }

        if(post.creator._id.toString() !== req.userId.toString()){
            const error = new Error("Not authorized!");
            error.code = 403;
            throw error;
        }

        const errors = [];
        if (
            validator.isEmpty(postInput.title) ||
            !validator.isLength(postInput.title, { min: 5 })
        ) {
            errors.push({ message: "Title is invalid." });
        }
        if (
            validator.isEmpty(postInput.content) ||
            !validator.isLength(postInput.content, { min: 5 })
        ) {
            errors.push({ message: "Content is invalid." });
        }
        if (errors.length > 0) {
            const error = new Error("Invalid input.");
            error.data = errors;
            error.code = 422;
            throw error;
        }

        post.content = postInput.content;
        post.title = postInput.title;
        if(postInput.imageUrl !== 'undefined'){
            post.imageUrl = postInput.imageUrl;
        }
        const updatedPost = await post.save();
        return {
            ...updatedPost._doc,
            createdAt: updatedPost.createdAt.toISOString(),
            _id: updatedPost._id.toString(),
            updatedAt: updatedPost.updatedAt.toISOString()
        }

    },
    deletePost: async function({id}, req){
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const post = await Post.findById(id);
        if (!post) {
            const error = new Error("No post found!");
            error.code = 404;
            throw error;
        }

        if(post.creator.toString() !== req.userId.toString()){
            const error = new Error("Not authorized!");
            error.code = 403;
            throw error;
        }

        clearImage(post.imageUrl);

        await Post.findByIdAndRemove(id);
        clearImmediate
        user.posts.pull(id);
        await user.save();

        return true;
    },
    user: async function(args, req){
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error("No user found!");
            error.code = 404;
            throw error;
        }

        return {...user._doc, _id: user._id.toString() }
    }, 
    updateStatus: async function({ status }, req) {
        if (!req.isAuth) {
            const error = new Error("Not authenticated!");
            error.code = 401;
            throw error;
        }

        const user = await User.findById(req.userId);
        if(!user){
            const error = new Error("No user found!");
            error.code = 404;
            throw error;
        }

        user.status = status;
        await user.save();
        return {...user._doc, _id: user._id.toString() }

    }
};
