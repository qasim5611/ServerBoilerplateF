import userService from "../../services/userServices/user.Service.js"
export {
    register,
    verifyEmail,
    authenticate,
    revokeToken,
    forgotPassword,
    resetPassword,
    refreshToken,
    update,
    _delete,
    getAll,
    getById
}
import { validationResult } from "express-validator";


function register(req, res, next) {

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json(validationErrors.array()[0]) // 400 for bad request
    }
    console.log(req.body.firstName);
    userService.register(req.body, req.hostname)
        .then(() => res.json({ message: 'Registration successful, please check your email for verification instructions' }))
        .catch(next);
}


function verifyEmail(req, res, next) {
    userService.verifyEmail(req.body.Token)
        .then(() => res.json({ message: 'Verification successful, you can now login' }))
        .catch(next);
}


function authenticate(req, res, next) {

    console.log(req);
    console.log(req);
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        return res.status(400).json(validationErrors.array()[0]) // 400 for bad request
    }
    const { email, password } = req.body;
    const ipAddress = req.ip;
    userService.authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...user }) => {
            setTokenCookie(res, refreshToken);
            res.json(user);
        })
        .catch(next);
}

function revokeToken(req, res, next) {

    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && req.user.role !== "Admin") {
        return res.status(401).json({ message: 'Unauthorized erf' });
    }

    userService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}


function forgotPassword(req, res, next) {

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json(validationErrors.array()[0]) // 400 for bad request
    }
    const origin = req.hostname;
    userService.forgotPassword(req.body, origin)
        .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}


function resetPassword(req, res, next) {

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json(validationErrors.array()[0]) // 400 for bad request
    }
    userService.resetPassword(req.body)
        .then(() => res.json({ message: 'Password reset successful, you can now login' }))
        .catch(next);
}


function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    userService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...user }) => {
            setTokenCookie(res, refreshToken);
            res.json(user);
        })
        .catch(next);
}


function update(req, res, next) {

    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json(validationErrors.array()[0]) // 400 for bad request
    }
    // users can update their own account and admins can update any account
    if (req.params.id !== req.user.id && req.user.role !== "Admin") {
        return res.status(401).json({ message: 'Unauthorized dfv' });
    }

    userService.update(req.params.id, req.body)
        .then(user => res.json(user))
        .catch(next);
}


function _delete(req, res, next) {
    // users can delete their own account and admins can delete any account
    if (req.params.id !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized fv' });
    }

    userService.delete(req.params.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}


function getAll(req, res, next) {
    userService.getAll()
        .then(users => res.json(users))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own account and admins can get any account
    if (req.params.id !== req.user.id && req.user.role !== "Admin") {
        return res.status(401).json({ message: 'Unauthorized ff' });
    }

    userService.getById(req.params.id)
        .then(user => user ? res.json(user) : res.sendStatus(404))
        .catch(next);
}


// helper functions

function setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}