const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 3 },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  githubToken: { type: String, default: null },
  githubUsername: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  reviewCount: { type: Number, default: 0 },
  plan: { type: String, enum: ['free', 'pro'], default: 'free' }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.githubToken;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
