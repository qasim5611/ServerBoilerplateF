import favouritesFolderModel from "../../models/addToFavouriteModels/favouritesFolder.Model.js"
import { validationResult } from "express-validator";



// route:  POST /api/favouritesFolder/
// desc:   creating favourites folder by user id
// access: PROTECTED
const postFavouriteFolder = async (req, res) => {

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json(validationErrors.array()[0]) // 400 for bad request
    }

    const folderName = req.body.folderName;
    // const userId = "617bcd2b666de38527fe3a94";
    const userId = req.user.id;

    try {
        const favouritesFolder = new favouritesFolderModel({
            userId: userId,
            folderName: folderName
        });
        await favouritesFolder.save();
        return res.status(201).json({ successMsg: "Folder created successfully" }); //201 for created
    } catch (err) {
        console.log("ERROR OCCOURED WHILE CREATING FAVOURITE FOLDER", err);
        res.status(500).json({ errorMsg: "Server Error" });
    }
};





// route:  GET /api/favouritesFolder/folder/:id
// desc:   reading a single folder by folder id
// access: PROTECTED
const getSingleFavouriteFolder = async (req, res) => {
    try {
        const folder = await favouritesFolderModel.findOne({ _id: req.params.id });

        if (!folder) {
            return res.status(404).json({ errorMsg: "Folder not found" })
        }

        return res.status(200).json(folder);

    } catch (err) {
        res.status(500).json({ errorMsg: "Server Error" }) // 500 for server error
        console.log("ERROR OCCOURED WHILE GETTING FOLDER", err);
    }
};




// route:  GET /api/favouritesFolder/all_folders/:id
// desc:   reading all user folders by user id
// access: PROTECTED
const getAllFavouriteFolder = async (req, res) => {
    try {
        const allFolders = await favouritesFolderModel.find({ userId: req.user.id });

        if (!allFolders) {
            return res.status(404).json({ errorMsg: "Folders not found" })
        }

        return res.status(200).json(allFolders);


    } catch (err) {
        res.status(500).json({ errorMsg: "Server Error" }) // server error
        console.log("ERROR OCCOURED WHILE GETTING FOLDER", err);
    }
};




// route:  DELETE /api/favouritesFolder/folder/:id
// desc:   deleting a single folders by folder id
// access: PROTECTED
const deleteSingleFolder = async (req, res) => {
    try {
        await favouritesFolderModel.deleteOne({ _id: req.params.id })
        return res.status(200).json({ successMsg: "Folder deleted successfully" });
    } catch (err) {
        res.status(500).json({ errorMsg: "Server Error" }) // server error
        console.log("ERROR OCCOURED WHILE DELETING FOLDER", err);
    }
};



// route:  DELETE /api/favouritesFolder/all_folders/:id
// desc:   deleting all folders by user id
// access: PROTECTED
const deleteAllfavouritesFolder = async (req, res) => {
    try {
        await favouritesFolderModel.deleteMany({ userId: req.user.id })
        return res.status(200).json({ successMsg: "Folders deleted successfully" });
    } catch (err) {
        res.status(500).json({ errorMsg: "Server Error" }) // server error
        console.log("ERROR OCCOURED WHILE DELETING FOLDER", err);
    }
};




// route:  PATCH /api/favouritesFolder/:id
// desc:   updating a folders by folder id
// access: PROTECTED
const updateFavouriteFolder = async (req, res) => {

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json(validationErrors.array()[0])
    }
    try {
        const folderName = req.body.folderName;
        await favouritesFolderModel.updateOne({ _id: req.params.id },
            { $set: { folderName: folderName } });
        return res.status(200).json({ successMsg: "Folder Updated Successfully" });
    } catch (err) {
        res.status(500).json({ errorMsg: "Server Error" }) // server error
        console.log("ERROR OCCOURED WHILE DELETING FOLDER", err);
    }

};



export {
    postFavouriteFolder,
    getSingleFavouriteFolder,
    getAllFavouriteFolder,
    deleteSingleFolder,
    deleteAllfavouritesFolder,
    updateFavouriteFolder
};