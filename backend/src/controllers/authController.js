const bcrypt = require('bcryptjs');
const prisma  = require('../lib/prisma');
const { generateToken } = require('../lib/jwt');

// Campos que se devuelven en respuestas de auth
const userSelect = {
  id:           true,
  email:        true,
  nombreCompleto: true,
  nombre:       true,
  apellido1:    true,
  apellido2:    true,
  rol:          true,
  areaId:       true,
  area: {
    select: {
      id: true,
      nombre: true,
      gerencias: {
        select: {
          gerencia: {
            select: {
              id: true,
              nombre: true,
              direccion: true,
              codigoPostal: true,
              localidad: true,
              provincia: true,
            },
          },
        },
      },
    },
  },
  numeroSAP:    true,
  direccion:    true,
  codigoPostal: true,
  localidad:    true,
  provincia:    true,
  telefono:     true,
  avatar:       true,
  avatarEntraId: true,
  activo:       true,
};

/**
 * Registro de usuario (solo desarrollo)
 */
async function register(req, res) {
  try {
    const { email, password, nombre, apellido1, apellido2, rol } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password son obligatorios',
      });
    }

    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.usuario.create({
      data: {
        email,
        password: hashedPassword,
        nombre:    nombre    || null,
        apellido1: apellido1 || null,
        apellido2: apellido2 || null,
        rol:       rol       || 'DELEGADO',
      },
      select: {
        id: true, email: true, nombre: true,
        apellido1: true, apellido2: true,
        rol: true, createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado correctamente',
      user,
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ success: false, message: 'Error al crear usuario' });
  }
}

/**
 * Login de usuario
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y password son obligatorios',
      });
    }

    const user = await prisma.usuario.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    if (!user.activo) {
      return res.status(401).json({ success: false, message: 'Usuario desactivado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = generateToken(user);

    const userData = await prisma.usuario.findUnique({
      where: { id: user.id },
      select: userSelect,
    });

    res.json({
      success: true,
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ success: false, message: 'Error al iniciar sesión' });
  }
}

/**
 * Obtener usuario autenticado
 */
async function me(req, res) {
  try {
    // Refrescar datos desde BD por si han cambiado
    const user = await prisma.usuario.findUnique({
      where: { id: req.user.id },
      select: userSelect,
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('Error en me:', error);
    res.status(500).json({ success: false, message: 'Error al obtener usuario' });
  }
}

/**
 * Actualizar perfil del usuario autenticado
 */
async function updateProfile(req, res) {
  try {
    const { nombre, apellido1, apellido2, direccion, codigoPostal, localidad, provincia, telefono } = req.body;
    const userId = req.user.id;

    const dataToUpdate = {};
    if (nombre       !== undefined) dataToUpdate.nombre       = nombre;
    if (apellido1    !== undefined) dataToUpdate.apellido1    = apellido1;
    if (apellido2    !== undefined) dataToUpdate.apellido2    = apellido2;
    if (direccion    !== undefined) dataToUpdate.direccion    = direccion;
    if (codigoPostal !== undefined) dataToUpdate.codigoPostal = codigoPostal;
    if (localidad    !== undefined) dataToUpdate.localidad    = localidad;
    if (provincia    !== undefined) dataToUpdate.provincia    = provincia;
    if (telefono     !== undefined) dataToUpdate.telefono     = telefono;

    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar',
      });
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: dataToUpdate,
      select: userSelect,
    });

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar perfil' });
  }
}

/**
 * Subir avatar del usuario autenticado
 */
async function uploadAvatar(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha proporcionado ninguna imagen',
      });
    }

    const { processImage, deleteFile, PATHS, getFileUrl } = require('../lib/fileHelper');

    const filename = await processImage(
      req.file.path,
      PATHS.avatars,
      'avatar'
    );

    const relativePath = `avatars/${filename}`;

    const usuario = await prisma.usuario.findUnique({ where: { id: req.user.id } });
    if (usuario.avatar) {
      await deleteFile(usuario.avatar);
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: req.user.id },
      data: { avatar: relativePath },
      select: userSelect,
    });

    res.json({
      success: true,
      message: 'Avatar actualizado exitosamente',
      user: {
        ...updatedUser,
        avatarUrl: getFileUrl(relativePath),
      },
    });
  } catch (error) {
    console.error('Error al subir avatar:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir avatar',
      error: error.message,
    });
  }
}

module.exports = {
  register,
  login,
  me,
  updateProfile,
  uploadAvatar,
};
