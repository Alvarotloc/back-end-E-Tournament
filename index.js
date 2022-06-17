import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  leerEventos,
  crearEvento,
  borrarEvento,
  actualizarEvento,
} from "./crud.js";

dotenv.config();

const servidor = express();

servidor.use(express.json());

const whiteList = [
  //Creamos la lista blanca de urls que vamos a admitir desde el backend
  process.env.FRONTEND_URL_CALENDAR,
  process.env.FRONTEND_URL_FORM,
];

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.includes(origin)) {
      //Si la url de la request está en la lista blanca, permitimos la request
      callback(null, true);
    } else {
      callback(new Error("Error de Cors"));
    }
  },
};

servidor.use(cors(corsOptions));

servidor
  .route("/eventos")
  .get(async (req, res) => {
    let eventos = await leerEventos();
    res.send(eventos);
  })
  .post(async (req, res) => {
    let eventoCreado = await crearEvento(req.body);
    if (eventoCreado.error) {
      res.status(403).send(eventoCreado);
      return;
    }
    res.send(eventoCreado);
  })
  .delete(async (req, res) => {
    let idBorrado = await borrarEvento(req.body._id);
    res.send(idBorrado);
  })
  .put(async (req, res) => {
    let eventoActualizado = await actualizarEvento(req.body);
    res.send(eventoActualizado);
  });

const port = process.env.PORT || 4000;

servidor.listen(port, () => {
  console.log(`Servidor en puerto ${port}`);
});
