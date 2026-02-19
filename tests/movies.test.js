import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";
import Movie from "../models/movie.model.js";

describe("API de Movies - CRUD completo", () => {
  // ============================================
  // CREATE - POST /api/movies
  // ============================================
  describe("POST /api/movies", () => {
    it("debería crear una película correctamente", async () => {
      // TODO: Enviar un POST a /api/movies con datos válidos
      // Verificar que la respuesta tiene status 201
      // Verificar que el body contiene los datos enviados y un _id
      // Verificar que la película se guardó en la base de datos

      const newMovie = {
        title: "The Matrix",
        director: "Lana y Lilly Wachowski",
        year: 1999,
        genre: "Ciencia ficción",
        rating: 9,
      };


      const response = await request(app)
        .post("/api/movies")
        .send(newMovie)
        .expect(201);

      expect(response.body.title).toBe("The Matrix");
      expect(response.body.director).toBe("Lana y Lilly Wachowski");
      expect(response.body.year).toBe(1999);
      expect(response.body.genre).toBe("Ciencia ficción");
      expect(response.body.rating).toBe(9);
      expect(response.body._id).toBeDefined();

      const movieInDB = await Movie.findById(response.body._id);
      expect(movieInDB).not.toBeNull();
      expect(movieInDB.title).toBe("The Matrix");
    });

    it("debería devolver 400 si falta el título", async () => {
      // TODO: Enviar un POST sin el campo "title"
      // Verificar que la respuesta tiene status 400
      // Verificar que el body contiene errores de validación (ej: response.body.title)

      const badMovie = {
        director: "Director sin titulo",
      };

      const response = await request(app)
        .post("/api/movies")
        .send(badMovie)
        .expect(400);

      expect(response.body.title.message).toBe("Path `title` is required.");
    });

    it("debería devolver 400 si falta el director", async () => {
      // TODO: Enviar un POST sin el campo "director"
      // Verificar que la respuesta tiene status 400
      // Verificar que el body contiene errores de validación (ej: response.body.director)

      const badMovie = {
        title: "Título sin director",
      };

      const response = await request(app)
        .post("/api/movies")
        .send(badMovie)
        .expect(400);

      expect(response.body.director.message).toBe("Path `director` is required.");
    });

    // BONUS: Escribe un test que verifique que el rating no puede ser mayor a 10
    it("el rating no puede ser mayor a 10", async () => {

      const newMovie = {
        title: "The Matrix",
        director: "Lana y Lilly Wachowski",
        year: 1999,
        genre: "Ciencia ficción",
        rating: 11,
      };

      const response = await request(app)
        .post("/api/movies")
        .send(newMovie)
        .expect(400);
      
      expect(response.body.rating.message).toBe('Path `rating` (11) is more than maximum allowed value (10).');
    });
  });

  // ============================================
  // READ ALL - GET /api/movies
  // ============================================
  describe("GET /api/movies", () => {
    it("debería devolver un array con las películas existentes", async () => {
      // TODO: Hacer GET a /api/movies
      // Verificar que la respuesta tiene status 200
      // Verificar que el body es un array

      await Movie.deleteMany();

      const response = await request(app).get("/api/movies").expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ============================================
  // READ ONE - GET /api/movies/:id
  // ============================================
  describe("GET /api/movies/:id", () => {
    it("debería devolver una película por su ID", async () => {
      // TODO: Crear una película directamente en la BDD con Movie.create()
      // Hacer GET a /api/movies/:id con el ID de la película creada
      // Verificar que la respuesta tiene status 200
      // Verificar que el body contiene los datos correctos

      const newMovie = {
        title: "Cazafantasmas",
        director: "Ivan Reitman",
        year: 1984,
        genre: "Comedia / Fantasía",
        rating: 8,
      };

      const movieCreated = await Movie.create(newMovie);

      const response = await request(app).get(`/api/movies/${movieCreated._id}`).expect(200);

      expect(response.body.title).toBe("Cazafantasmas");
      expect(response.body.director).toBe("Ivan Reitman");
      expect(response.body.year).toBe(1984);
      expect(response.body.genre).toBe("Comedia / Fantasía");
      expect(response.body.rating).toBe(8);
      expect(response.body._id).toBeDefined();
    });

    it("debería devolver 404 si la película no existe", async () => {
      // TODO: Hacer GET con un ID válido pero inexistente (ej: '64f1a2b3c4d5e6f7a8b9c0d1')
      // Verificar que la respuesta tiene status 404
      // Verificar que el mensaje es 'Película no encontrada'

      const fakeId = "64f1a2b3c4d5e6f7a8b9c0d1";
      const response = await request(app).get(`/api/movies/${fakeId}`).expect(404);
      expect(response.body.message).toBe("Película no encontrada");
    });
  });

  // ============================================
  // UPDATE - PATCH /api/movies/:id
  // ============================================
  describe("PATCH /api/movies/:id", () => {
    it("debería actualizar parcialmente una película existente", async () => {
      // TODO: Crear una película en la BDD
      // Enviar PATCH con solo algunos campos modificados
      // Verificar status 200
      // Verificar que los campos enviados se actualizaron
      // Verificar que los campos NO enviados mantienen su valor original

      const movie = await Movie.create({
        title: "Titanic",
        director: "James Cameron",
        year: 1997,
        genre: "Romance / Drama",
        rating: 7.9,
      });

      const updatedData = {
        title: 'Updated Title',
        year: 2026,
      };

      const response = await request(app)
        .patch(`/api/movies/${movie._id}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.title).toBe('Updated Title');
      expect(response.body.year).toBe(2026);
      expect(response.body.director).toBe('James Cameron');
      expect(response.body.genre).toBe('Romance / Drama');
      expect(response.body.rating).toBe(7.9);
    });

    it("debería devolver 404 si la película a actualizar no existe", async () => {
      // TODO: Enviar PATCH a un ID inexistente
      // Verificar status 404
      const fakeId = "64f1a2b3c4d5e6f7a8b9c0d1";
      const response = await request(app).patch(`/api/movies/${fakeId}`).expect(404);
      expect(response.body.message).toBe("Película no encontrada");
    });
  });

  // ============================================
  // DELETE - DELETE /api/movies/:id
  // ============================================
  describe("DELETE /api/movies/:id", () => {
    it("debería eliminar una película existente", async () => {
      // TODO: Crear una película en la BDD
      // Enviar DELETE a /api/movies/:id
      // Verificar status 204
      // Verificar que la película ya NO existe en la BDD

      const movie = await Movie.create({
        title: "Parásitos",
        director: "Bong Joon-ho",
        year: 2019,
        genre: "Drama / Thriller",
        rating: 8.5,
      });

      await request(app).delete(`/api/movies/${movie._id}`).expect(204);

      const movieInDB = await Movie.findById(movie._id);
      expect(movieInDB).toBeNull();
    });

    it("debería devolver 404 si la película a eliminar no existe", async () => {
      // TODO: Enviar DELETE a un ID inexistente
      // Verificar status 404
      const fakeId = "64f1a2b3c4d5e6f7a8b9c0d1";
      const response = await request(app).delete(`/api/movies/${fakeId}`).expect(404);
      expect(response.body.message).toBe("Película no encontrada");
    });
  });

  // ============================================
  // BONUS: Flujo completo CRUD
  // ============================================
  describe("Flujo completo CRUD", () => {
    it("debería crear, leer, actualizar y eliminar una película", async () => {
      // TODO (BONUS): Implementar el flujo completo en un solo test
      // 1. POST - Crear una película → verificar 201
      // 2. GET  - Leer la película creada → verificar 200 y datos correctos
      // 3. PATCH - Actualizar el título → verificar 200 y cambio aplicado
      // 4. DELETE - Eliminar la película → verificar 204
      // 5. GET  - Intentar leer la película eliminada → verificar 404
           // 1. CREATE
      const createRes = await request(app)
        .post("/api/movies")
        .send({
          title: "El Señor de los Anillos: La Comunidad del Anillo",
          director: "Peter Jackson",
          year: 2001,
          genre: "Fantasía / Aventura",
          rating: 8.8,
        })
        .expect(201);

      const movieId = createRes.body._id;

      // 2. READ - Verificar que existe
      const readRes = await request(app)
        .get(`/api/movies/${movieId}`)
        .expect(200);

      expect(readRes.body.title).toBe("El Señor de los Anillos: La Comunidad del Anillo");

      // 3. UPDATE (PATCH)
      const updateRes = await request(app)
        .patch(`/api/movies/${movieId}`)
        .send({ title: "El Señor de los Anillos: Las Dos Torres" })
        .expect(200);

      expect(updateRes.body.title).toBe("El Señor de los Anillos: Las Dos Torres");
      expect(updateRes.body.director).toBe("Peter Jackson"); // No debe cambiar

      // 4. DELETE
      await request(app).delete(`/api/movies/${movieId}`).expect(204);

      // 5. Verificar que ya no existe
      await request(app).get(`/api/movies/${movieId}`).expect(404);
    });
  });
});
