import favouritePostsModel from "../../models/addToFavouriteModels/favouritePost.Model.js";
import { validationResult } from "express-validator";


// route:  POST /api/favouritePosts/:id
// desc:   creating post by favourites folder id
// access: PROTECTED
const postFavouritePost = async (req, res) => {
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json(validationErrors.array()[0]) // 400 for bad request
    }

    try {
        const post = new favouritePostsModel(req.body);
        post.folderId = req.params.id;
        await post.save();
        return res.status(201).json({ successMsg: "Added to favourite folder" }); //201 for created
    } catch (err) {
        res.status(500).json({ errorMsg: "Server Error" }); //409 for conflict
        console.log("ERROR OCCOURED WHILE ADDING POST TO FAVOURITES FOLDER", err);
    }

};



// route:  GET /api/favouritePosts/post/:id
// desc:   reading a single post by post id
// access: PROTECTED
const getSinglePost = async (req, res) => {
    const postId = req.params.id;
    try {
        const post = await favouritePostsModel.findOne({ _id: postId });

        if (!post) {
            return res.status(404).json({ errorMsg: "Post does not exist" })
        }

        return res.status(200).json(post);

    } catch (err) {
        res.status(500).json({ errorMsg: "Server Error" }) //500 for server error
        console.log("ERROR OCCOURED WHILE GETTING POST", err);
    }
};


// route:  GET /api/favouritePosts/all_posts/:id
// desc:   reading all posts in favourites folder by folder id
// access: PROTECTED
const getAllPosts = async (req, res,) => {
    const folderId = req.params.id;
    try {
        const posts = await favouritePostsModel.find({ folderId: folderId });

        if (!posts) {
            return res.status(404).json({ errorMsg: "Posts does not exist" })
        }

        return res.status(200).json(posts);


    } catch (err) {
        res.status(500).json({ errorMsg: "Server error" }) //500 for server error
        console.log("ERROR OCCOURED WHILE GETTING POSTs", err);
    }
};


// route:  DELETE /api/favouritePosts/post/:id
// desc:   Deleting a post by post id
// access: PROTECTED
const deleteSinglePost = async (req, res) => {
    const postId = req.params.id;
    try {
        await favouritePostsModel.deleteOne({ _id: postId });
        return res.status(200).json({ successMsg: "Post deleted successfully" });

    } catch (err) {
        res.status(500).json({ errorMsg: "Server Error" }) //500 for server error
        console.log("ERROR OCCOURED WHILE DELETING POST", err);
    }
};



// route:  DELETE /api/favouritePosts/all_posts/:id
// desc:   Deleting all posts in favourites folder by folder id
// access: PROTECTED
const deleteAllPosts = async (req, res) => {
    const folderId = req.params.id;
    try {
        await favouritePostsModel.deleteMany({ folderId: folderId });
        return res.status(200).json({ successMsg: "Posts deleted successfully" });

    } catch (err) {
        res.status(500).json({ errorMsg: "Server Error" }) //500 for server error
        console.log("ERROR OCCOURED WHILE DELETING POST", err);
    }
};




// route:  PATCH /api/favouritePosts/:id
// desc:   Updating a post by post id
// access: PROTECTED
const updatePost = async (req, res) => {

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json(validationErrors.array()[0]) // 400 for bad request
    }

    const postId = req.params.id;
    try {
        await favouritePostsModel.updateOne({ _id: postId }, { $set: req.body });
        return res.status(200).json({ successMsg: "Post updated successfully" });

    } catch (err) {
        console.log("ERROR OCCOURED WHILE DELETING POST", err);
        res.status(500).json({ errorMsg: "Server error" }) //500 for server error
    }

};


export {
    postFavouritePost,
    getSinglePost,
    getAllPosts,
    deleteSinglePost,
    deleteAllPosts,
    updatePost
};