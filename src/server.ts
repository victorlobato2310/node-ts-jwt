import bodyParser from 'body-parser';
import express from 'express';
import logging from './config/logging';
import config from './config/config';
import userRoutes from './routes/user';
import mongoose from 'mongoose';

const NAMESPACE = 'Servidor';
const router = express();

/** Conectando ao Mongo */
mongoose
    .connect(config.mongo.url, config.mongo.options)
    .then((result) => {
        logging.info(NAMESPACE, 'Mongo conectado');
    })
    .catch((error) => {
        logging.error(NAMESPACE, error.message, error);
    });

/** Log da request */
router.use((req, res, next) => {
    /** Log da req */
    logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - IP: [${req.socket.remoteAddress}]`);

    res.on('finish', () => {
        /** Log da res */
        logging.info(NAMESPACE, `METHOD: [${req.method}] - URL: [${req.url}] - STATUS: [${res.statusCode}] - IP: [${req.socket.remoteAddress}]`);
    });

    next();
});

/** Fazendo o parse do corpo da request */
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

/** Regras para API */
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

/** Rotas */
router.use('/users', userRoutes);

/** Error handling */
router.use((req, res, next) => {
    const error = new Error('Não encontado');

    res.status(404).json({
        message: error.message
    });
});


router.listen(config.server.port, () => logging.info(NAMESPACE, `Servidor rodando em ${config.server.hostname}:${config.server.port}`));