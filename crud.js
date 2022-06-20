import { MongoClient, ObjectId } from "mongodb"; // Importa el cliente de MongoDB
import dotenv from "dotenv"; //Volvemos a importar el paquete para leer enviroment variables
dotenv.config();

const urlMongo = process.env.MONGO_CONECTION; // Leemos la variable de entorno

const objConfig = { 
  useUnifiedTopology: true, 
};

const conectar = () => MongoClient.connect(urlMongo, objConfig); // Función para conectar con MongoDB

const leerEventos = async () => {
  const conexion = await conectar(); // Conectamos con MongoDB
  const db = conexion.db("eTournament"); // Seleccionamos la base de datos

  return new Promise((callback) => { // Creamos una promesa que nos retorne los resultados de la petición a la bbdd
    db.collection("eTournament")
      .find({})
      .toArray((error, resultado) => {
        conexion.close();
        if (error) return callback(msgError);
        return callback(resultado);
      });
  });
};

const comprobarExistenEventos = async (fecha) => { // Función para comprobar si existen eventos en la fecha indicada, función auxiliar
  const conexion = await conectar(); // Conectamos con MongoDB
  const db = conexion.db("eTournament"); // Seleccionamos la base de datos
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
  const { fecha } = objEvento; // Extraemos la fecha del objeto
  const eventosExistentes = await comprobarExistenEventos(fecha); // Comprobamos si existen eventos en la fecha indicada
  if (eventosExistentes.length > 0) { // Si existen eventos en la fecha indicada mandamos un error al front
    return { error: "Solo puede haber un evento" };
  }
  if (Object.keys(objEvento).length > 0) { // Si el objeto no está vacío, lo insertamos en la bbdd
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

  return new Promise((callback) => { // En base al id recibido borramos ese registro en la bbdd
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
  const { _id, fecha, descripcion, participantes, nombre } = objEvento; // Extraemos los datos del objeto

  let resultado = await db
    .collection("eTournament")
    .find({ _id: ObjectId(_id) })
    .toArray(); // Comprobamos si existe un evento con ese id


  if (resultado.length > 0) { // Si existe, comprobamos si tiene eventos asignados
    const eventosExistentes = await comprobarExistenEventos(fecha);
    if(eventosExistentes.length > 0 && resultado[0].fecha !== fecha){ // Si tiene eventos asignados y la fecha es distinta a la actual, mandamos un error al front (ya que si la fecha es la misma de ahora si le tenemos que dejar actualizarlo)
      return { error: "Solo puede haber un evento" };
    }
      return new Promise((callback) => { // Si no tiene eventos asignados, actualizamos el evento
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
