import express  from "express";
import controller from '../controllers/user';
import extractJWT from "../middleware/extractJWT";


const router = express.Router();

router.get('/validar', extractJWT, controller.validarToken);

router.post('/registrar', controller.registrar);

router.post('/login', controller.fazerLogin);

router.get('/get/all', extractJWT, controller.obterTodosUsuarios);

export = router;