import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

const urlMongo = process.env.MONGO_CONECTION;
const objConfig = {
  useUnifiedTopology: true,
};

const conectar = () => MongoClient.connect(urlMongo, objConfig);

const leerEventos = async () => {
  const conexion = await conectar();
  const db = conexion.db("eTournament");

  return new Promise((callback) => {
    db.collection("eTournament")
      .find({})
      .toArray((error, resultado) => {
        conexion.close();
        if (error) return callback(msgError);
        return callback(resultado);
      });
  });
};
const comprobarExistenEventos = async (fecha) => {
  const conexion = await conectar();
  const db = conexion.db("eTournament");
  return new Promise((callback) => {
    db.collection("eTournament")
      .find({ fecha })
      .toArray((error, resultado) => {
        conexion.close();
        return callback(resultado);
      });
  });
};
const crearEvento = async (objEvento) => {
  const conexion = await conectar();
  const db = conexion.db("eTournament");
  const { fecha } = objEvento;
  const eventosExistentes = await comprobarExistenEventos(fecha);
  if (eventosExistentes.length > 0) {
    return { error: "Solo puede haber un evento" };
  }
  if (Object.keys(objEvento).length > 0) {
    return new Promise((callback) => {
      db.collection("eTournament").insertOne(objEvento, (error, resultado) => {
        conexion.close();
        if (error) return callback(error);
        return callback(objEvento);
      });
    });
  }
};

const borrarEvento = async (_id) => {
  const conexion = await conectar();
  const db = conexion.db("eTournament");

  return new Promise((callback) => {
    db.collection("eTournament").deleteOne(
      { _id: ObjectId(_id) },
      (error, resultado) => {
        conexion.close();
        if (error) return callback(msgError);
        return callback({ _id });
      }
    );
  });
};

const actualizarEvento = async (objEvento) => {
  const conexion = await conectar();
  const db = conexion.db("eTournament");
  const { _id, fecha, descripcion, participantes, nombre } = objEvento;

  let resultado = await db
    .collection("eTournament")
    .find({ _id: ObjectId(_id) })
    .toArray();


  if (resultado.length > 0) {
    const eventosExistentes = await comprobarExistenEventos(fecha);
    if(eventosExistentes.length > 0 && resultado[0].fecha !== fecha){
      return { error: "Solo puede haber un evento" };
    }
      return new Promise((callback) => {
        db.collection("eTournament").updateOne(
          { _id: ObjectId(_id) },
          { $set: { fecha, descripcion, participantes, nombre } },
          (error, respuesta) => {
            conexion.close();
            if (error) {
              callback(error);
            } else {
              callback(objEvento);
            }
          }
        );
      });
  }
};

export { leerEventos, crearEvento, borrarEvento, actualizarEvento };
