import mongoose from "mongoose";
const Schema = mongoose.Schema;


const customTopicsSchema = new Schema({

    userId: {
        type: Schema.Types.ObjectId,
        ref: "userModel",
    },

    name: {
        type: String,
    },


    filters: {

        type: {
            type: String,
        },
        sort: {
            type: String,
        },
        startdate: {
            type: Date,
        },
        enddate: {
            type: Date,
        },
        language: {
            type: String,
        },
        engagement: {
            type: String
        }
    },

    selection: {
        match_type: {
            type: String,
        },
        sources: {
            type: String,
        },
        any_keywords: [String],
        must_also_keywords: [String],
        must_not_contains_keywords: [String],
        include_domains: [String],
        exclude_domains: [String],
        limit_domains_results: [String],
    },

    date: {
        type: Date,
        default: Date.now,
    },
});

const customTopicsModel = mongoose.model("customTopic", customTopicsSchema); 
export default customTopicsModel;