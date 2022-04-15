import mongoose from "mongoose";
const Schema = mongoose.Schema;

const favouritePostsSchema = new Schema({
    folderId: {
        type: Schema.Types.ObjectId,
        ref: "favouritesFolderModel"
    },

    index: {
        type: String,
    },

    title: {
        type: String,
    },

    maintext: {
        type: String,
    },

    category: {
        type: String,
    },

    language: {
        type: String,
    },

    source_domain: {
        type: String,
    },

    readtime: {
        type: Number,
    },

    facebook: {
        type: Number,
    },

    twitter: {
        type: Number,
    },

    image_url: {
        type: String,
    },

    url: {
        type: String,
    },

    post_id: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    },

    date_publish: {
        type: Date
    }
});

const favouritePostsModel = mongoose.model("favouritePost", favouritePostsSchema);

export default favouritePostsModel;