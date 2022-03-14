import { Request, Response, NextFunction } from "express";
import logging from "../config/logging";
import jwt from 'jsonwebtoken';
import config from '../config/config';

const NAMESCPACE = "Auth";

const extractJWT = (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESCPACE, "Validando Token");

    let token = req.headers.authorization?.split(' ')[1]; // dividindo o array pelo espaço pois o token = Bearer  token

    if(token){
        jwt.verify(token, config.server.token.secret, (error, decoded) => {
            if(error){
                return res.status(404).json({
                    message: error.message,
                    error
                });
            }
            else{
                res.locals.jwt = decoded;
                next();
            }
        });   
    }
    else{
        return res.status(401).json({
            message: "Não autorizado"
        });
    }

}

export default extractJWT;