const bodyParser = require("body-parser");
const express = require("express");
const router = express.Router();
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));
require('../db/mongoose')
const userModel = require("../models/user");
const auth = require('../middleware/auth')
router.get('/test',(req,res)=>{
    res.send("From a new File")
})

router.get("/users",(req,res)=>{
    userModel.find({}).then((users)=>{
        res.status(200).send(users);
    }).catch((error)=>{
        res.status(400).send();
    });
})
router.post("/users/login", async (req, res) => {
    try{
        const user = await userModel.findOneByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user, token});
    }
    catch (e) {
        res.status(400).send(e.message);
    }
});
router.get('/users/me', auth, async (req, res) => {

    const users = req.user;
    await users.populate('tasks').execPopulate();
    let data = users.name + '\n'+ users.age+'\n'+ users.email+'\n Мої tasks:\n'+ users.tasks;
    res.send(data);
});
router.delete('/users/me', auth, async (req, res) => {
    try{
        await req.user.remove();
        res.send(req.user)
    }catch (e){
        res.status(500).send(e.message)
    }
});

router.put('/users/me', auth, async (req, res) => {
    try {
        const updates = ['name', 'email',  'password','age'];
        updates.forEach((update) => req.user[update] = req.body[update]);
        await req.user.save();
        res.send(req.user);
    }catch (e) {
        res.status(500).send(e);
    }
});

router.post("/user/add",  async(req, res)=>{
    let name = req.body.name;
    console.log( req.body.name)
    let age = req.body.age;
    let email = req.body.email;
    let password = req.body.password;
    const user = new userModel({name: name, age: age, email: email, password: password});
    try {
        const token = await user.generateAuthToken();
        await user.save().then(() => {
            console.log(user);
            res.status(200).send({user, token});
        }).catch((error) => {
            res.status(500).send(error);
        });
    }catch (e) {
        res.status(500).send(e);
    }

});

router.use("/user-update/:id",async (req, res) =>{
    const user = await userModel.findById(req.params.id);
    try {
        const updates = ['name', 'email',  'password','age'];
        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();
        res.send(user);
    }catch (e) {
        res.status(500).send(e);
    }
});

router.get('/user/:id', async (req, res) => {
    const id = req.params.id
    try {
        if (!id) {
            throw new Error()
        }
        const result = await userModel.findOne({ _id: id })
        res.send(result)
    } catch {
        res.send({ code: 404, message: 'Not found' })
    }
})
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token;
        });
        await req.user.save();
        res.send();
    } catch (e) {
        res.status(500).send(e.message);
    }
});
router.use("/users/logoutAll", auth, async (req, res) => {
    try{
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send("Logout from all devices");
    }catch (e) {
        res.status(500).send(e.message);
    }
});

module.exports = router;
