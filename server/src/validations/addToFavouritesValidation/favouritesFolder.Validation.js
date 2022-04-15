import {body } from "express-validator";


const postFavouritesFolderValidation = [
    body("folderName")
    .trim()
    .notEmpty().withMessage("folder name is required")
    .isLength({ min: 2 }).withMessage("name must b greater than 2 characters")
];

const updateFavouriteFolderValidation =  [
    body("folderName")
    .trim().notEmpty().withMessage("folder name is required")
    .isLength({ min: 2 }).withMessage("name must b greater than 2 characters")
];
    

export {
    postFavouritesFolderValidation,
    updateFavouriteFolderValidation
};