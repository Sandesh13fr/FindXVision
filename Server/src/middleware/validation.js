import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req, res, next)=> {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    res.status(400).json({
      success,
      message: 'Validation failed',
      errors: errors.array()
    });
    return;
  }
  
  next();
};

export default validateRequest;
