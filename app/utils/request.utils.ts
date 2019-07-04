import {validationResult} from 'express-validator';
import {constants} from 'http2';

export class BadTokenError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class ClientError extends Error {
  constructor(message) {
    super(message);
  }
}

export const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(constants.HTTP_STATUS_BAD_REQUEST).json({errors: errors.array()});
  };
};
export const errorHandler = (app) => {
  app.use((err: Error, req, res, next) => {
    if (err instanceof ClientError) {
      return res.status(constants.HTTP_STATUS_BAD_REQUEST).json(err.message)
    }
    if (err instanceof BadTokenError) {
      return res.status(constants.HTTP_STATUS_UNAUTHORIZED).json(err.message)
    }
    return res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).json(err.message)
  })
};

