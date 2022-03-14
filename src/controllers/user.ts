import { NextFunction, Request, Response } from "express";
import logging from "../config/logging";
import bcryptjs from 'bcryptjs';
import mongoose from "mongoose";
import jwt from 'jsonwebtoken';
import User from '../models/user';
import signJWT from "../functions/signJWT";


const NAMESPACE = "Usuario";


const validarToken = (req: Request, res: Response, next: NextFunction) => {
   logging.info(NAMESPACE, "Token validado, usuário autorizado");

   return res.status(200).json({
       message: "Autorizado"
   });
};

const registrar = (req: Request, res: Response, next: NextFunction) => {
   let { username, password } = req.body;

   bcryptjs.hash(password, 10, (hashError, hash) => {
        if(hashError){
            return res.status(500).json({
                message: hashError.message,
                error: hashError
            });
        }

        // TO DO: INSERIR USUARIO NO BD

        const user = new User({
            _id: new mongoose.Types.ObjectId(),
            username,
            password: hash
        });

        return user.save()
        .then( user => {
            return res.status(201).json({
                user
            })
        }).catch(error => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
   });

};

const fazerLogin = (req: Request, res: Response, next: NextFunction) => {
   
    let { username, password } = req.body;

    User.find({ username })
        .exec()
        .then((users) => {
            if (users.length !== 1) {
                return res.status(401).json({
                    message: 'Não autorizado'
                });
            }

            bcryptjs.compare(password, users[0].password, (error, result) => {
                if (error) {
                    return res.status(401).json({
                        message: 'Não autorizado'
                    });
                } else if (result) {
                    signJWT(users[0], (_error, token) => {
                        if (_error) {
                            return res.status(500).json({
                                message: _error.message,
                                error: _error
                            });
                        } else if (token) {
                            return res.status(200).json({
                                message: 'Autorizado com sucesso',
                                token: token,
                                user: users[0]
                            });
                        }
                    });
                }
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

const obterTodosUsuarios = (req: Request, res: Response, next: NextFunction) => {
    User.find()
        .select('-password')
        .exec()
        .then((users) => {
            return res.status(200).json({
                users: users,
                count: users.length
            });
        })
        .catch((error) => {
            return res.status(500).json({
                message: error.message,
                error
            });
        });
};


export default { validarToken, registrar, fazerLogin, obterTodosUsuarios };