const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware para procesar JSON en las solicitudes
app.use(express.json());

// Permitir solicitudes de http://localhost:8100 (frontend)
app.use(cors({
  origin: 'http://localhost:8100',
}));

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


let users = [
  { id: 1, username: 'Admin', fullname: 'Administrador', password: 'admin123',  email:'admin@duoc.cl', role: 1 },
  { id: 2, username: 'Pasajero', fullname: 'Pasajero Prueba', password: 'pasajero123',  email:'pasajero@duoc.cl', role: 2 },
  { id: 3, username: 'Conductor', fullname: 'Conductor Prueba', password: 'conductor123',  email:'conductor@duoc.cl', role: 3, isActive: false },
];

// Obtener todos los usuarios
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Crear un nuevo usuario
app.post('/api/users', (req, res) => {
  const newUser = { id: Date.now(), ...req.body };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Actualizar un usuario por ID
app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex((user) => user.id === parseInt(id));
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...req.body };
    res.json(users[userIndex]);
  } else {
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
});

// Eliminar un usuario por ID
app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const userIndex = users.findIndex((user) => user.id === parseInt(id));
  if (userIndex !== -1) {
    const deletedUser = users.splice(userIndex, 1);
    res.json(deletedUser);
  } else {
    res.status(404).json({ message: 'Usuario no encontrado' });
  }
});

