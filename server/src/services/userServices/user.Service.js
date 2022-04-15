import mongoose from "mongoose"
import nodemailer from "nodemailer";
import userModel from "../../models/userModel/user.Model.js";
import refreshTokenModel from "../../models/userModel/refreshToken.Model.js"
import { jwt_secret_key } from "../../config/jwtConfig.js"
import bcrypt from "bcrypt";
import crypto from "crypto";
// import { sendmail } from "../EmailSender/sendmail.js";
import jwt from "jsonwebtoken"
const userService = {
    register,
    verifyEmail,
    authenticate,
    revokeToken,
    forgotPassword,
    resetPassword,
    refreshToken,
    update,
    delete: _delete,
    getAll,
    getById,
}
export default userService;




async function register(params, origin) {

    // validate
    if (await userModel.findOne({ email: params.email })) {
        // send already registered error in email to prevent user enumeration
        throw "Email alredy exist"
        // return await sendAlreadyRegisteredEmail(params.email, origin);// comment it
    }

    // create user object
    const user = new userModel(params);
    console.log(user);

    // first registered user is an admin
    const isFirstUser = (await userModel.countDocuments({})) === 0;
    user.role = isFirstUser ? "Admin" : "User";
    user.verificationToken = randomTokenString();

    // hash password
    user.passwordHash = hash(params.password);

    // save user
    await user.save();
    console.log(user);
    // send email
    await sendVerificationEmail(user, origin);
}

async function sendVerificationEmail(user, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/user/verify-email?token=${user.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/user/verify-email</code> api route:</p>
                   <p><code>${user.verificationToken}</code></p>`;
    }


    // await sendEmail({
    //     to: user.email,
    //     subject: 'Sign-up Verification API - Verify Email',
    //     html: `<h4>Verify Email</h4>
    //            <p>Thanks for registering!</p>
    //            ${message}`
    // });
    console.log({
        to: user.email,
        subject: 'Sign-up Verification API - Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });




  var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    // ssl:     true,
    secure: false,
    requireTLS: true,
    auth: {
      user: "qasimtahir5611@gmail.com",
      pass: "Qasim@1048576",
    },
  });

  
    // await sendmail(message, user, origin);

  // await sendEmail(message, user, origin);
//   console.log("code", message);
  const mailOptions = {
    from: `"Verify Your Accout by Token" <qasimtahir5611@gmail.com>`,
    to: `${user.email}`,
    subject: "Please Vrifiy your Email account",
    html: `
     <h3 style="font-family: cursive">Hy ${user.firstName} TechSchema wansts to Verify your Email by Token... </h3>
     <h3>${message}</h3>`,
  };
  console.log(mailOptions);
  smtpTransport.sendMail(mailOptions, function (error, response) {
    if (error) {
      console.log(error);
      return error;
    } else {
      console.log(response);
      return response;
    }
  });





    
}

async function verifyEmail( token ) {
    try {
        const user = await userModel.findOne({ verificationToken: token });
        console.log(token)
        if (!user) throw 'Verification failed';
        user.verified = Date.now();
        user.verificationToken = undefined;
        await user.save();
    }
    catch (err) {
        throw err.message
    }
}


async function authenticate({ email, password, ipAddress }) {
    const user = await userModel.findOne({ email });
    
    console.log(user);
    console.log(user);

    if (!user || !user.isVerified || !bcrypt.compareSync(password, user.passwordHash)) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function forgotPassword({ email }, origin) {
    try {
        const user = await userModel.findOne({ email: email });

        // always return ok response to prevent email enumeration
        if (!user) return;

        // create reset token that expires after 24 hours
        user.resetToken = {
            token: randomTokenString(),
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
        await user.save();

        // send email
        await sendPasswordResetEmail(user, origin);
    } catch (err) {
        console.log(err)
    }

}


async function resetPassword({ token, password }) {
    try {
        const user = await userModel.findOne({
            token: token,
            expires: { $gt: Date.now() }
        });

        if (!user) throw 'Invalid token';

        // update password and remove reset token
        user.passwordHash = hash(password);
        user.passwordReset = Date.now();
        user.resetToken = undefined;
        await user.save();

    } catch (err) {
        console.log(err);
    }
}


async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    const user = refreshToken.userId;
    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(user, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(user);

    // return basic details and tokens
    return {
        ...basicDetails(user),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}


async function update(id, params) {
    const user = await getUser(id);
    // validate (if email was changed)
    if (params.email && user.email !== params.email && await userModel.findOne({ email: params.email })) {
        throw 'Email "' + params.email + '" is already taken';
    }

    // hash password if it was entered
    if (params.password) {
        params.passwordHash = hash(params.password);
    }


    // copy params to user and save
    Object.assign(user, params);
    user.updated = Date.now();
    await user.save();

    return basicDetails(user);
}


async function _delete(id) {
    const account = await getUser(id);
    await account.remove();
}


async function getAll() {
    const users = await userModel.find();
    return users.map(x => basicDetails(x));
}

async function getById(id) {
    const user = await getUser(id);
    return basicDetails(user);
}


// helper functoins

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function hash(password) {
    return bcrypt.hashSync(password, 10);
}

function generateJwtToken(user) {

    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: user.id, id: user.id }, jwt_secret_key, { expiresIn: '15m' });
}

function generateRefreshToken(user, ipAddress) {
    // create a refresh token that expires in 7 days
    return new refreshTokenModel({
        userId: user.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
}


function basicDetails(user) {
    const { id, title, firstName, lastName, email, role, created, updated, isVerified } = user;
    return { id, title, firstName, lastName, email, role, created, updated, isVerified };
}

async function getRefreshToken(token) {
    try {
        const refreshToken = await refreshTokenModel.findOne({ token }).populate('userId');
        if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
        return refreshToken;

    } catch (err) {
        console.log(err)
    }
}


async function sendPasswordResetEmail(user, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/account/reset-password?token=${user.resetToken.token}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/account/reset-password</code> api route:</p>
                   <p><code>${user.resetToken.token}</code></p>`;
    }

    // await sendEmail({
    //     to: user.email,
    //     subject: 'Sign-up Verification API - Reset Password',
    //     html: `<h4>Reset Password Email</h4>
    //            ${message}`
    // });

    console.log({
        to: user.email,
        subject: 'Sign-up Verification API - Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}

async function getUser(id) {
    if (!isValidId(id)) throw 'user not found';

    const user = await userModel.findById(id);
    if (!user) throw 'user not found';
    return user;
}

function isValidId(id) {
    return mongoose.Types.ObjectId.isValid(id);
}