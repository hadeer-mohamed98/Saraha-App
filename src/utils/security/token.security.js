import Jwt from "jsonwebtoken";
import * as DBService from "../../DB/db.service.js";
import { roleEnum, UserModel } from "../../DB/models/User.model.js";
import { nanoid } from "nanoid";
import { TokenModel } from "../../DB/models/Token.model.js";

export const signatureLevelEnum = { Bearer: "Bearer", System: "System" };
export const tokenTypeEnum = { access: "access", refresh: "refresh" };
export const logoutEnum = {
  signoutFromAll: "signoutFromAll",
  signout: "signout",
  stayLoggedIn: "stayLoggedIn",
};

export const generateToken = async ({
  payload = {},
  signature = process.env.ACCESS_USER_TOKEN_SIGNATURE,
  options = { expiresIn: Number(process.env.ACCESS_EXPIRES_IN) },
} = {}) => {
  return Jwt.sign(payload, signature, options);
};

export const verifyToken = async ({
  token = "",
  signature = process.env.ACCESS_USER_TOKEN_SIGNATURE,
} = {}) => {
  return Jwt.verify(token, signature);
};

export const getSignatures = async ({
  signatureLevel = signatureLevelEnum.Bearer,
} = {}) => {
  let signatures = { accessSignature: undefined, refreshSignature: undefined };
  switch (signatureLevel) {
    case signatureLevelEnum.System:
      signatures.accessSignature = process.env.ACCESS_SYSTEM_TOKEN_SIGNATURE;
      signatures.refreshSignature = process.env.REFRESH_SYSTEM_TOKEN_SIGNATURE;
      break;
    default:
      signatures.accessSignature = process.env.ACCESS_USER_TOKEN_SIGNATURE;
      signatures.refreshSignature = process.env.REFRESH_USER_TOKEN_SIGNATURE;
      break;
  }
  return signatures;
};

export const decodedToken = async ({
  next,
  authorization = "",
  tokenType = tokenTypeEnum.access,
} = {}) => {
  const [bearer, token] = authorization?.split(" ") || [];

  if (!bearer || !token) {
    return next(new Error("missing token parts", { cause: 401 }));
  }
  let signatures = await getSignatures({
    signatureLevel: bearer,
  });
  const decoded = await verifyToken({
    token,
    signature:
      tokenType === tokenTypeEnum.access
        ? signatures.accessSignature
        : signatures.refreshSignature,
  });
  if (!decoded?._id) {
    return next(new Error("invalid-token", { cause: 400 }));
  }

  if (
    decoded.jti &&
    (await DBService.findOne({
      model: TokenModel,
      filter: { jti: decoded.jti },
    }))
  ) {
    return next(new Error("invalid login credentials", { cause: 401 }));
  }

  const user = await DBService.findById({
    model: UserModel,
    id: decoded._id,
  });

  if (!user) {
    return next(new Error("not register account", { cause: 404 }));
  }

  if (user.changeCredentialsTime?.getTime() > decoded.iat * 1000) {
    return next(new Error("invalid login credentials", { cause: 401 }));
  }
  return { user, decoded };
};

export const generateLoginCredentials = async ({ user } = {}) => {
  let signatures = await getSignatures({
    signatureLevel:
      user.role != roleEnum.user
        ? signatureLevelEnum.System
        : signatureLevelEnum.Bearer,
  });
  const jwtid = nanoid();
  const access_token = await generateToken({
    payload: { _id: user._id },
    signature: signatures.accessSignature,
    options: {
      jwtid,
      expiresIn: Number(process.env.ACCESS_EXPIRES_IN),
    },
  });

  const refresh_token = await generateToken({
    payload: { _id: user._id },
    signature: signatures.refreshSignature,
    options: {
      jwtid,
      expiresIn: Number(process.env.REFRESH_EXPIRES_IN),
    },
  });
  return { refresh_token, access_token };
};

export const createRevokeToken = async ({ req } = {}) => {
  await DBService.create({
    model: TokenModel,
    data: [
      {
        jti: req.decoded.jti,
        expiresIn: req.decoded.iat + Number(process.env.REFRESH_EXPIRES_IN),
        userId: req.decoded._id,
      },
    ],
  });
};
