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
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../database");
const database_2 = require("../database");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, password2 } = req.body;
    const result = yield (0, database_2.registerUser)(username, password, false);
    if (result === "User registered successfully") {
        return res.redirect("/home");
    }
    else {
        return res.status(400).send(result);
    }
}));
router.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    let wrongCredentials = true;
    try {
        const user = yield database_1.usersCollection.findOne({ username });
        if (!user) {
            return res.render('login', { wrongCredentials });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { wrongCredentials });
        }
        req.session.user = user;
        return res.redirect("/home");
    }
    catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).send('Server error');
    }
}));
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Server error');
        }
        res.redirect('/');
    });
});
exports.default = router;
