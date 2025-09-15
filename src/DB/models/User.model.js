import mongoose, { model } from "mongoose";

export let genderEnum = { male: "male", female: "female" };
export let roleEnum = { user: "user", admin: "admin" };
export let providerEnum = { system: "system", google: "google" };
// console.log(Object.values(genderEnum));
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [2, "min length is 2 char and you have entered {VALUE}"],
      maxLength: [
        20,
        "first name max legnth is 20 char and you have entered {VALUE}",
      ],
    },
    lastName: {
      type: String,
      required: [true, "name is mandatory"],
      minLength: [2, "min length is 2 char and you have entered {VALUE}"],
      maxLength: [
        20,
        "last name max legnth is 20 char and you have entered {VALUE}",
      ],
    },
    email: { type: String, unique: true, required: true },
    password: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
    },
    oldPasswords: [String],
    forgotPasswordOTP: String,
    // confirmPassword: { type: String, unique: true },
    confirmPassword: { type: String, select: false },
    phone: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
    },

    gender: {
      type: String,
      enum: {
        values: Object.values(genderEnum),
        message: `gender only allow ${Object.values(genderEnum)}`,
      },
      default: genderEnum.male,
    },
    role: {
      type: String,
      enum: Object.values(roleEnum),
      default: roleEnum.user,
    },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },
    confirmEmail: Date,
    confirmEmailOtp: String,
    picture: { secure_url: String, public_id: String },
    cover: [{ secure_url: String, public_id: String }],

    deletedAt: Date,
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },

    restoredAt: Date,
    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    changeCredentialsTime: Date,
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);
userSchema
  .virtual("fullName")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });

userSchema.virtual("messages", {
  localField: "_id",
  foreignField: "receiverId",
  ref: "Message",
});
export const UserModel = mongoose.models.User || model("User", userSchema);
UserModel.syncIndexes();
