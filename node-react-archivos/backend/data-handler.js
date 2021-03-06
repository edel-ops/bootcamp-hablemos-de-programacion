const fs = require("fs");
const path = require("path");
const directorioBase = path.join(__dirname, "data");

const dataHandler = {
  crear: async ({
    directorioEntidad = "mascotas",
    nombreArchivo,
    datosGuardar,
  }) => {
    try {
      const fileDescriptor = await fs.promises.open(
        `${directorioBase}/${directorioEntidad}/${nombreArchivo}.json`,
        "wx"
      );
      const datosEnString = JSON.stringify(datosGuardar);
      await fs.promises.writeFile(fileDescriptor, datosEnString);
      return datosGuardar;
    } catch (error) {
      return error;
    }
  },
  obtenerUno: async ({
    directorioEntidad = "mascotas",
    nombreArchivo,
    agregarExtension = true,
  }) => {
    try {
      let archivo = null;
      if (agregarExtension) {
        archivo = `${directorioBase}/${directorioEntidad}/${nombreArchivo}.json`;
      } else {
        archivo = `${directorioBase}/${directorioEntidad}/${nombreArchivo}`;
      }
      const resultado = await fs.promises.readFile(archivo, {
        encoding: "utf-8",
      });
      return resultado;
    } catch (error) {
      return new Error("No se pudo leer el archivo o no existe");
    }
  },
  listar: async ({ directorioEntidad = "mascotas" }) => {
    try {
      let archivos = await fs.promises.readdir(
        `${directorioBase}/${directorioEntidad}/`
      );
      archivos = archivos.filter((file) => file.includes(".json"));
      const arrayPromesasLeerArchivo = archivos.map((archivo) => {
        return dataHandler.obtenerUno({
          directorioEntidad,
          nombreArchivo: archivo,
          agregarExtension: false,
        });
      });
      let datosArchivos = await Promise.all(arrayPromesasLeerArchivo);
      datosArchivos = datosArchivos.map(JSON.parse);
      return datosArchivos;
    } catch (error) {
      return new Error(`No se pude listar desde ${directorioBase}`);
    }
  },
  actualizar: async ({
    directorioEntidad = "mascotas",
    nombreArchivo,
    datosActuales,
  }) => {
    try {
      const rutaCompleta = `${directorioBase}/${directorioEntidad}/${nombreArchivo}.json`;
      const existeArchivo = fs.existsSync(rutaCompleta);
      if(!existeArchivo) {
        throw new Error(`La entidad con id = ${nombreArchivo} no existe`);
      }
      const datosAnterioresString = await dataHandler.obtenerUno({
        directorioEntidad,
        nombreArchivo
      });
      const datosAnterioresJSON = JSON.parse(datosAnterioresString);
  
      const resultadoEliminar = await fs.promises.unlink(rutaCompleta);
      console.log({resultadoEliminar});

      const fileDescriptor = await fs.promises.open(
        rutaCompleta,
        "wx"
      );
      const datosFinalesParaGuardar = {...datosAnterioresJSON, ...datosActuales};
      const datosEnString = JSON.stringify(datosFinalesParaGuardar);
      await fs.promises.writeFile(fileDescriptor, datosEnString);
      return datosFinalesParaGuardar;
    } catch (error) {
      return error;
    }
  },
};

module.exports = dataHandler;
