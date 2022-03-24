const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const getToken = require('../utils/getTokenForUser');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  fullname: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  username: { type: String, unique: true },
  password: String,
  phone: String,
  // avatar: { type: String, default: 'https://i.pinimg.com/originals/9d/05/86/9d0586ac63b7e7a30a6ffafcbb4e0a93.gif' },
  // con meo
  // avatar: { type: String, default: 'https://cdn.fbsbx.com/v/t59.2708-21/275282424_658601665255245_2692979565625322288_n.gif?_nc_cat=102&ccb=1-5&_nc_sid=041f46&_nc_ohc=4o-Px3DdbEIAX9OgIm9&_nc_ht=cdn.fbsbx.com&oh=03_AVJdq0G21w8IAcTi27Zbr8b8Miz8bodh8lwBZY34srYk_w&oe=623A26B1' },
  avatar: { type: String, default: 'https://media3.giphy.com/media/XGbfacwWVO9J34OSBL/giphy.gif' },
  primary: { type: String, default: '2' },
  access_token: String,
}, { timestamps: true });

userSchema.pre('save', function (next) {
  const user = this;

  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err);

      user.password = hash;
      user.access_token = getToken(user);
      next();
    });
  });
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return reject(err);

      resolve(isMatch);
    });
  });
};

module.exports = mongoose.model('user', userSchema);

