const express = require('express');
const User = require('../../../models/user');
const co = require('co');
const loginValidator = require('../../../shared/validations/login');
const signupValidator = require('../../../shared/validations/signup');
const bcrypt = require('bcrypt-nodejs');


const router = express.Router();

router.put('/:username/update', (req, res, next) => {
  const { fullname, email, password, phone, primary } = req.body;
  // hash password
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  co(function* () {
    const existingEmail = yield User.findOne({ email });

    if (existingEmail & existingEmail !== email) {
      const error = new Error('Email already exists');
      error.status = 400;
      throw error;
    }

    // update user
    const user = User.findOneAndUpdate({ username: req.params.username }, {
      fullname,
      email,
      password: hash,
      phone,
      primary,
    }, { new: true });
    return user;
  })
  .then(user => res.json(user))
  .catch(err => next(err));
});

router.post('/signup', (req, res, next) => {
  const { fullname, email, username, password, phone } = req.body;
  const { isValid, errors } = signupValidator(req.body);

  if (!isValid) {
    return res.status(400).json({ error: true, errors });
  }

  co(function* () {
    const existingUser = yield User.findOne({ username });
    const existingEmail = yield User.findOne({ email });
    
    if (existingEmail) {
      return res.status(400).json({ error: true, errors: { email: 'Email already exists' } });
    }

    if (existingUser) {
      const error = { status: 400, errors: { username: 'Username already exists' } };
      throw error;
    }

    const user = new User({ fullname, email, username, password, phone });
    return user.save();
  })
  .then(user => res.json({
    fullname: user.fullname,
    avatar: user.avatar || 'https://i.pinimg.com/originals/9d/05/86/9d0586ac63b7e7a30a6ffafcbb4e0a93.gif',
    username: user.username,
    email: user.email,
    primary: user.primary,
    phone: user.phone,
    password: user.password,
    access_token: user.access_token,
  }))
  .catch(err => next(err));
});

router.post('/login', (req, res, next) => {
  const { username, password } = req.body;
  const { isValid, errors } = loginValidator(req.body);

  if (!isValid) {
    return res.status(400).json({ error: true, errors });
  }

  co(function* () {
    const user = yield User.findOne({ username });
    if (!user) {
      const error = { status: 401, errors: { username: 'Invalid username' } };
      throw error;
    }

    const isMatch = yield user.comparePassword(password);
    if (!isMatch) {
      const error = { status: 401, errors: { password: 'Invalid password' } };
      throw error;
    }
    return user;
  })
  .then(user => res.json({
    fullname: user.fullname,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    primary: user.primary,
    username: user.username,
    password: user.password,
    access_token: user.access_token,
  }))
  .catch(err => next(err));
});

router.post('/all', (req, res, next) => {
  co(function* () {
    const users = yield User.find();
    return users;
  })
  .then(user => res.json(user
  ))
  .catch(err => next(err));
});

// delete user
router.delete('/:username/delete', (req, res, next) => {
  co(function* () {
    const user = yield User.findOneAndRemove({ username: req.params.username });
    return user;
  })
  .then(user => res.json(user))
  .catch(err => next(err));
});

module.exports = router;

