const express = require('express')
const Joi = require('joi')
const bcrypt = require('bcrypt')

const {findByUsername, createUser} = require("../database/user-queries");

const router = express.Router()

const schema = Joi.object({
    username: Joi.string().min(3).max(100).required(),
    password: Joi.string().min(8).max(255).required(),
})
function validateUser(user) {
    return schema.validate(user)
}

router.post('/register', async (req, res) => {
    const { error } = schema.validate(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message)
    }
    let user = await findByUsername({ username: req.body.username })
    if (user) {
        return res.status(400).send('User already exisits. Please sign in')
    }

    try {
        const salt = await bcrypt.genSalt(10)
        const password_hash = await bcrypt.hash(req.body.password, salt)
        await createUser({
            username: req.body.username,
            password_hash: password_hash
        })
        return res.status(201).json({message: 'Registration successful'})
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
});


module.exports = router;
