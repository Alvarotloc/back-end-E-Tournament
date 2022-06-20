import express from "express"; //Importamos el paquete express para crear el servidor
import cors from "cors"; //Importamos el paquete cors para permitir el acceso a todos los dominios que tengamos en la white_list
import dotenv from "dotenv"; //Importamos el paquete dotenv para leer las variables de entorno
import {
  leerEventos,
  crearEvento,
  borrarEvento,
  actualizarEvento,
} from "./crud.js"; //Importamos el archivo crud.js para poder usar las funciones que contiene

dotenv.config(); //Llamamos a la funcion dotenv para leer las variables de entorno

const servidor = express(); //Llamamos a la funcion express para crear el servidor

servidor.use(express.json()); //Llamamos a la funcion json para que nos permita recibir datos en formato json (lo que era body-parser)

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

servidor.use(cors(corsOptions)); //Le decimos a los cors que utilicen el corsOptions

servidor
  .route("/eventos") //Creamos una ruta para el endpoint /eventos
  .get(async (req, res) => { //Creamos una funcion que se ejecute cuando se haga una peticion GET a /eventos
    let eventos = await leerEventos();
    res.send(eventos);
  })
  .post(async (req, res) => { //Creamos una funcion que se ejecute cuando se haga una peticion POST a /eventos
    let eventoCreado = await crearEvento(req.body);
    if (eventoCreado.error) { //Si hay un error en la creacion del evento, lo enviamos al frontend con un código de error
      res.status(403).send(eventoCreado);
      return;
    }
    res.send(eventoCreado);
  })
  .delete(async (req, res) => { //Creamos una funcion que se ejecute cuando se haga una peticion DELETE a /eventos
    let idBorrado = await borrarEvento(req.body._id);
    res.send(idBorrado);
  })
  .put(async (req, res) => { //Creamos una funcion que se ejecute cuando se haga una peticion PUT a /eventos
    let eventoActualizado = await actualizarEvento(req.body);
    if (eventoActualizado.error) { //Si hay un error en la actualizacion del evento, lo enviamos al frontend con un código de error
      res.status(403).send(eventoActualizado);
      return;
    }
    res.send(eventoActualizado);
  });

const port = process.env.PORT || 4000; //Creamos una variable port para guardar el puerto que queremos utilizar

servidor.listen(port, () => { //Llamamos a la funcion listen para que escuche en el puerto que queremos
  console.log(`Servidor en puerto ${port}`);
});
