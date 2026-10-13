const mongoose = require('mongoose');

// User schema -- Boluwatife Alewi
// The proposal says Users stores profiles, emails and OAuth IDs.
//
// Only firstName, lastName and email are required. When OAuth is added,
// the login code needs to fill these in from the Google or GitHub profile.
// Anything else stays optional, because an OAuth profile will not have it.
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name must be 50 characters or fewer']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name must be 50 characters or fewer']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address']
  },
  // Admins create and manage events and venues, per the proposal
  role: {
    type: String,
    enum: {
      values: ['attendee', 'admin'],
      message: 'Role must be attendee or admin'
    },
    default: 'attendee'
  },
  // Filled in by OAuth. The proposal leaves Google or GitHub open, so
  // store which one plus the id it gave us. No password is ever stored.
  oauthProvider: {
    type: String,
    enum: {
      values: ['google', 'github'],
      message: 'OAuth provider must be google or github'
    }
  },
  oauthId: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[0-9+()\-\s]{7,20}$/, 'Please use a valid phone number']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

userSchema.index(
  { oauthProvider: 1, oauthId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      oauthProvider: { $exists: true },
      oauthId: { $exists: true }
    }
  }
);

module.exports = mongoose.model('User', userSchema);
