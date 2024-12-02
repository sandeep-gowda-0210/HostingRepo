const User = require('../../model/userSchema')

async function getUsers(req, res) {
    try {
        let users = await User.find();
        // console.log(users);
        res.json(users);
    }
    catch (err) {
        res.send(`server error  ${err.message}`)
    }
}
async function addUser(req, res) {
    try {
        const userdata = req.body;
        const user = new User(userdata)
        const data = await user.save()
        res.status(200).send(`registered successfully : ${data}`)
    }
    catch (err) {
        // console.log(err.message);
        res.send(`unable to add user  ${err.message}`)
    }
}

module.exports = { getUsers, addUser }