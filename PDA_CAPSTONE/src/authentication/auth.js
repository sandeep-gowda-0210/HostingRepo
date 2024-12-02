const jwt = require('jsonwebtoken')
const User = require('../../model/userSchema')
const env = require('dotenv')
env.config()
const JWT_SECRET = process.env.JWT_SECRET
async function login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required');
    }
    try {

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }
        if (!(user.password === password)) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
        );
        res.cookie('token', token, { httpOnly: true });
        res.status(200).send(`Logged in successfully token: ${token}`);
    } catch (err) {
        res.status(500).send('Server error');
    }
}

function authenticate(req, res, next) {
    try {

        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).send('Access denied');
        }
        const verified = jwt.verify(token, JWT_SECRET);
        // console.log("userdata", verified);

        req.user = verified;
        next();
    } catch (err) {
        return res.status(401).send('Invalid or expired token');
    }
};

async function logout(req, res) {
    res.clearCookie('token');
    res.status(200).send('Logged out successfully');
}

module.exports = { login, logout, authenticate }