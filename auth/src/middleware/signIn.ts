import {body} from 'express-validator';


export const validateSignIn = [
    body('email')
    .isEmail()
    .withMessage('Email must be valid'),
body('password')
    .trim()
    .notEmpty()
    .withMessage('You must supply a password')
]