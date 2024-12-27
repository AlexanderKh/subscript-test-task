const crypto = require('crypto')
const express = require('express')
const Joi = require('joi')
const bcrypt = require('bcrypt')

const {findByUsername, createUser, saveSessionToken} = require("../database/user-queries");
const {findByOrganizationName} = require("../database/organization-queries");

const router = express.Router()

const loginSchema = Joi.object({
    username: Joi.string().min(3).max(100).required(),
    password: Joi.string().min(8).max(255).required(),
})
const registrationSchema = Joi.object({
    username: Joi.string().min(3).max(100).required(),
    password: Joi.string().min(8).max(255).required(),
    organization_name: Joi.string().required(),
})

const COOKIE_TIMEOUT = 1000 * 60 * 60 * 24

router.post('/register', async (req, res) => {
    const { error } = registrationSchema.validate(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message)
    }
    let user = await findByUsername({ username: req.body.username })
    if (user) {
        return res.status(400).send('User already exisits. Please sign in')
    }
    const organization = await findByOrganizationName({ name: req.body.organization_name })
    if (!organization) {
        return res.status(400).send(`Organization ${req.body.organization_name} does not exist`)
    }

    try {
        const salt = await bcrypt.genSalt(10)
        const password_hash = await bcrypt.hash(req.body.password, salt)
        await createUser({
            username: req.body.username,
            password_hash: password_hash,
            organization_id: organization.id,
        })
        return res.status(201).json({message: 'Registration successful'})
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
});



router.post('/login', async (req, res) => {
    const { error } = loginSchema.validate(req.body)
    if (error) {
        return res.status(400).send(error.details[0].message)
    }

    try {
        let user = await findByUsername({ username: req.body.username })
        if (!user) {
            return res.status(400).send('Incorrect email or password.')
        }
        const correctPassword = await bcrypt.compare(req.body.password, user.password_hash)
        if (!correctPassword) {
            return res.status(400).json({ message: 'Incorrect email or password.' })
        }

        const sessionToken = crypto.randomBytes(64).toString('hex');
        await saveSessionToken({ userId: user.id, sessionToken })

        res.cookie(
            "sessionToken", sessionToken, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: COOKIE_TIMEOUT
            })
        res.json({ message: 'Successfully logged in' })
    } catch (err) {
        return res.status(400).json({ message: err.message })
    }
});

module.exports = router;
