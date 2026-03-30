const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path   = require('path');
const prisma = new PrismaClient();

const {
  processImage,
  ensureDirectories,
  PATHS,
} = require('../src/lib/fileHelper');

// Imágenes fuente
const FILES_PATH = process.env.FILES_PATH || path.join(__dirname, 'files');
const IMG_SRC = {
  vinilo:          path.join(FILES_PATH, 'materiales', 'vinilo.jpg'),
  bata:            path.join(FILES_PATH, 'materiales', 'bata.jpg'),
  kitPromocional:  path.join(FILES_PATH, 'materiales', 'kit_promocional.jpg'),
  rollUp:          path.join(FILES_PATH, 'materiales', 'roll-up.jpg'),
  avatarDefault:   path.join(FILES_PATH, 'avatars', 'default.webp'),
};

async function procesarImagenAvatar(srcPath) {
  const filename = await processImage(srcPath, PATHS.avatars, 'avatar', false);
  return `avatars/${filename}`;
}

async function procesarImagenMaterial(srcPath) {
  const filenamePrincipal = await processImage(srcPath, PATHS.materialesPrincipales, 'principal', false);
  const filenameZoom      = await processImage(srcPath, PATHS.materialesPrincipales, 'zoom',      false);
  const filenameThumbnail = await processImage(srcPath, PATHS.materialesPrincipales, 'thumbnail', false);
  return {
    imagen:     `materiales/principales/${filenamePrincipal}`,
    imagenZoom: `materiales/principales/${filenameZoom}`,
    thumbnail:  `materiales/principales/${filenameThumbnail}`,
  };
}

async function main() {
  console.log('Iniciando seed...');
  await ensureDirectories();

  // ============================================
  // LIMPIEZA PREVIA (orden inverso a dependencias)
  // ============================================
  console.log('Limpiando base de datos...');
  await prisma.fotoInstalacion.deleteMany();
  await prisma.solicitud.deleteMany();
  await prisma.establecimiento.deleteMany();
  await prisma.material.deleteMany();
  await prisma.marca.deleteMany();
  await prisma.proveedor.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.gerencia.deleteMany(); // cascade → gerenciaArea
  await prisma.area.deleteMany();
  await prisma.configuracion.deleteMany();
  console.log('  Base de datos limpia');

  // ============================================
  // ÁREAS
  // ============================================
  console.log('Creando áreas...');
  const [area1, area2, area3, area4] = await Promise.all([
    prisma.area.create({ data: { nombre: 'Madrid Centro' } }),
    prisma.area.create({ data: { nombre: 'Madrid Periferia' } }),
    prisma.area.create({ data: { nombre: 'Sevilla' } }),
    prisma.area.create({ data: { nombre: 'Córdoba' } }),
  ]);
  console.log('  4 áreas creadas (Madrid Centro, Madrid Periferia, Sevilla, Córdoba)');

  // ============================================
  // GERENCIAS (con áreas asociadas)
  // Gerencia Centro → Madrid Centro + Madrid Periferia
  // Gerencia Sur    → Sevilla + Córdoba
  // ============================================
  console.log('Creando gerencias...');
  await Promise.all([
    prisma.gerencia.create({
      data: {
        nombre:       'Gerencia Centro',
        direccion:    'Calle Génova, 20',
        codigoPostal: '28004',
        localidad:    'Madrid',
        provincia:    'Madrid',
        areas: {
          create: [
            { areaId: area1.id },
            { areaId: area2.id },
          ],
        },
      },
    }),
    prisma.gerencia.create({
      data: {
        nombre:       'Gerencia Sur',
        direccion:    'Avenida de la Constitución, 15',
        codigoPostal: '41001',
        localidad:    'Sevilla',
        provincia:    'Sevilla',
        areas: {
          create: [
            { areaId: area3.id },
            { areaId: area4.id },
          ],
        },
      },
    }),
  ]);
  console.log('  2 gerencias creadas');
  console.log('    Gerencia Centro → Madrid Centro + Madrid Periferia');
  console.log('    Gerencia Sur    → Sevilla + Córdoba');

  // ============================================
  // USUARIOS
  // 1 admin + 4 gerentes (1/área) + 8 delegados (2/área)
  // ============================================
  console.log('Procesando avatar por defecto...');
  const avatarDefault = await procesarImagenAvatar(IMG_SRC.avatarDefault);

  console.log('Creando usuarios...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const [
    ,            // admin — no necesitamos la referencia
    gerente1, gerente2, gerente3, gerente4,
    delegado1, delegado2, delegado3, delegado4,
    delegado5, delegado6, delegado7, delegado8,
  ] = await Promise.all([

    // ── ADMIN ────────────────────────────────
    prisma.usuario.create({
      data: {
        email:        'admin@example.com',
        password:     hashedPassword,
        nombre:       'Prueba',
        apellido1:    'Admin',
        rol:          'ADMIN',
        avatar:       avatarDefault,
        direccion:    'Calle Admin, 1',
        codigoPostal: '28001',
        localidad:    'Madrid',
      },
    }),

    // ── GERENTES ─────────────────────────────
    // Gerente Área Madrid Centro
    prisma.usuario.create({
      data: {
        email:        'gerente@example.com',
        password:     hashedPassword,
        nombre:       'Prueba',
        apellido1:    'Gerente',
        rol:          'GERENTE',
        avatar:       avatarDefault,
        areaId:       area1.id,
        direccion:    'Calle Génova, 20',
        codigoPostal: '28004',
        localidad:    'Madrid',
      },
    }),
    // Gerente Área Madrid Periferia
    prisma.usuario.create({
      data: {
        email:        'gerente2@example.com',
        password:     hashedPassword,
        nombre:       'Isabel',
        apellido1:    'Moreno',
        apellido2:    'Ramos',
        rol:          'GERENTE',
        avatar:       avatarDefault,
        areaId:       area2.id,
        direccion:    'Avenida de España, 5',
        codigoPostal: '28901',
        localidad:    'Getafe',
      },
    }),
    // Gerente Área Sevilla
    prisma.usuario.create({
      data: {
        email:        'gerente3@example.com',
        password:     hashedPassword,
        nombre:       'Manuel',
        apellido1:    'Romero',
        apellido2:    'Torres',
        rol:          'GERENTE',
        avatar:       avatarDefault,
        areaId:       area3.id,
        direccion:    'Calle Sierpes, 30',
        codigoPostal: '41001',
        localidad:    'Sevilla',
      },
    }),
    // Gerente Área Córdoba
    prisma.usuario.create({
      data: {
        email:        'gerente4@example.com',
        password:     hashedPassword,
        nombre:       'Laura',
        apellido1:    'Castro',
        apellido2:    'Jiménez',
        rol:          'GERENTE',
        avatar:       avatarDefault,
        areaId:       area4.id,
        direccion:    'Calle Cruz Conde, 8',
        codigoPostal: '14001',
        localidad:    'Córdoba',
      },
    }),

    // ── DELEGADOS MADRID CENTRO ───────────────
    prisma.usuario.create({
      data: {
        email:        'delegado@example.com',
        password:     hashedPassword,
        nombre:       'Prueba',
        apellido1:    'Delegado',
        rol:          'DELEGADO',
        avatar:       avatarDefault,
        areaId:       area1.id,
        direccion:    'Calle Mayor, 20',
        codigoPostal: '28013',
        localidad:    'Madrid',
      },
    }),
    prisma.usuario.create({
      data: {
        email:        'delegado2@example.com',
        password:     hashedPassword,
        nombre:       'Javier',
        apellido1:    'Ruiz',
        apellido2:    'García',
        rol:          'DELEGADO',
        avatar:       avatarDefault,
        areaId:       area1.id,
        direccion:    'Calle Fuencarral, 45',
        codigoPostal: '28004',
        localidad:    'Madrid',
      },
    }),

    // ── DELEGADOS MADRID PERIFERIA ────────────
    prisma.usuario.create({
      data: {
        email:        'delegado3@example.com',
        password:     hashedPassword,
        nombre:       'Marta',
        apellido1:    'López',
        apellido2:    'Fernández',
        rol:          'DELEGADO',
        avatar:       avatarDefault,
        areaId:       area2.id,
        direccion:    'Calle Toledo, 12',
        codigoPostal: '28901',
        localidad:    'Getafe',
      },
    }),
    prisma.usuario.create({
      data: {
        email:        'delegado4@example.com',
        password:     hashedPassword,
        nombre:       'Pedro',
        apellido1:    'Sánchez',
        apellido2:    'Molina',
        rol:          'DELEGADO',
        avatar:       avatarDefault,
        areaId:       area2.id,
        direccion:    'Avenida de Madrid, 33',
        codigoPostal: '28100',
        localidad:    'Alcobendas',
      },
    }),

    // ── DELEGADOS SEVILLA ─────────────────────
    prisma.usuario.create({
      data: {
        email:        'delegado5@example.com',
        password:     hashedPassword,
        nombre:       'Ana',
        apellido1:    'González',
        apellido2:    'Moreno',
        rol:          'DELEGADO',
        avatar:       avatarDefault,
        areaId:       area3.id,
        direccion:    'Calle Betis, 12',
        codigoPostal: '41010',
        localidad:    'Sevilla',
      },
    }),
    prisma.usuario.create({
      data: {
        email:        'delegado6@example.com',
        password:     hashedPassword,
        nombre:       'Carlos',
        apellido1:    'Jiménez',
        apellido2:    'Pérez',
        rol:          'DELEGADO',
        avatar:       avatarDefault,
        areaId:       area3.id,
        direccion:    'Avenida de la Palmera, 5',
        codigoPostal: '41012',
        localidad:    'Sevilla',
      },
    }),

    // ── DELEGADOS CÓRDOBA ─────────────────────
    prisma.usuario.create({
      data: {
        email:        'delegado7@example.com',
        password:     hashedPassword,
        nombre:       'Sofía',
        apellido1:    'Navarro',
        apellido2:    'Blanco',
        rol:          'DELEGADO',
        avatar:       avatarDefault,
        areaId:       area4.id,
        direccion:    'Calle Gondomar, 3',
        codigoPostal: '14001',
        localidad:    'Córdoba',
      },
    }),
    prisma.usuario.create({
      data: {
        email:        'delegado8@example.com',
        password:     hashedPassword,
        nombre:       'Tomás',
        apellido1:    'Herrera',
        apellido2:    'Vega',
        rol:          'DELEGADO',
        avatar:       avatarDefault,
        areaId:       area4.id,
        direccion:    'Avenida del Brillante, 20',
        codigoPostal: '14012',
        localidad:    'Córdoba',
      },
    }),
  ]);
  console.log('  13 usuarios creados (1 admin, 4 gerentes, 8 delegados)');

  // ============================================
  // ESTABLECIMIENTOS
  // Clínicas → asignadas a gerentes
  // Farmacias → asignadas a delegados (2 por delegado)
  // ============================================
  console.log('Creando establecimientos...');
  await Promise.all([

    // ── CLÍNICAS ─────────────────────────────
    // Gerente 1 (Madrid Centro) — 2 clínicas
    prisma.establecimiento.create({
      data: {
        tipo:         'CLINICA',
        nombre:       'Clínica Centro Madrid 1',
        direccion:    'Calle Génova, 22',
        localidad:    'Madrid',
        provincia:    'Madrid',
        codigoPostal: '28004',
        areaId:       area1.id,
        delegadoId:   gerente1.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'CLINICA',
        nombre:       'Clínica Centro Madrid 2',
        direccion:    'Calle Serrano, 60',
        localidad:    'Madrid',
        provincia:    'Madrid',
        codigoPostal: '28001',
        areaId:       area1.id,
        delegadoId:   gerente1.id,
      },
    }),
    // Gerente 2 (Madrid Periferia) — 1 clínica
    prisma.establecimiento.create({
      data: {
        tipo:         'CLINICA',
        nombre:       'Clínica Getafe',
        direccion:    'Avenida de España, 8',
        localidad:    'Getafe',
        provincia:    'Madrid',
        codigoPostal: '28901',
        areaId:       area2.id,
        delegadoId:   gerente2.id,
      },
    }),
    // Gerente 3 (Sevilla) — 2 clínicas
    prisma.establecimiento.create({
      data: {
        tipo:         'CLINICA',
        nombre:       'Clínica Sevilla Centro',
        direccion:    'Calle Sierpes, 32',
        localidad:    'Sevilla',
        provincia:    'Sevilla',
        codigoPostal: '41001',
        areaId:       area3.id,
        delegadoId:   gerente3.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'CLINICA',
        nombre:       'Clínica Sevilla Triana',
        direccion:    'Calle Betis, 40',
        localidad:    'Sevilla',
        provincia:    'Sevilla',
        codigoPostal: '41010',
        areaId:       area3.id,
        delegadoId:   gerente3.id,
      },
    }),
    // Gerente 4 (Córdoba) — 1 clínica
    prisma.establecimiento.create({
      data: {
        tipo:         'CLINICA',
        nombre:       'Clínica Córdoba',
        direccion:    'Avenida del Gran Capitán, 15',
        localidad:    'Córdoba',
        provincia:    'Córdoba',
        codigoPostal: '14001',
        areaId:       area4.id,
        delegadoId:   gerente4.id,
      },
    }),

    // ── FARMACIAS MADRID CENTRO ───────────────
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Mayor',
        direccion:    'Calle Mayor, 1',
        localidad:    'Madrid',
        provincia:    'Madrid',
        codigoPostal: '28013',
        areaId:       area1.id,
        delegadoId:   delegado1.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Gran Vía',
        direccion:    'Gran Vía, 42',
        localidad:    'Madrid',
        provincia:    'Madrid',
        codigoPostal: '28013',
        areaId:       area1.id,
        delegadoId:   delegado1.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Fuencarral',
        direccion:    'Calle Fuencarral, 80',
        localidad:    'Madrid',
        provincia:    'Madrid',
        codigoPostal: '28004',
        areaId:       area1.id,
        delegadoId:   delegado2.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Retiro',
        direccion:    'Calle Alcalá, 120',
        localidad:    'Madrid',
        provincia:    'Madrid',
        codigoPostal: '28009',
        areaId:       area1.id,
        delegadoId:   delegado2.id,
      },
    }),

    // ── FARMACIAS MADRID PERIFERIA ────────────
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Getafe Centro',
        direccion:    'Calle Toledo, 15',
        localidad:    'Getafe',
        provincia:    'Madrid',
        codigoPostal: '28901',
        areaId:       area2.id,
        delegadoId:   delegado3.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Leganés',
        direccion:    'Avenida de la Constitución, 30',
        localidad:    'Leganés',
        provincia:    'Madrid',
        codigoPostal: '28914',
        areaId:       area2.id,
        delegadoId:   delegado3.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Alcobendas',
        direccion:    'Avenida de Madrid, 35',
        localidad:    'Alcobendas',
        provincia:    'Madrid',
        codigoPostal: '28100',
        areaId:       area2.id,
        delegadoId:   delegado4.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Alcalá de Henares',
        direccion:    'Calle Mayor, 10',
        localidad:    'Alcalá de Henares',
        provincia:    'Madrid',
        codigoPostal: '28801',
        areaId:       area2.id,
        delegadoId:   delegado4.id,
      },
    }),

    // ── FARMACIAS SEVILLA ─────────────────────
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Triana',
        direccion:    'Calle Betis, 22',
        localidad:    'Sevilla',
        provincia:    'Sevilla',
        codigoPostal: '41010',
        areaId:       area3.id,
        delegadoId:   delegado5.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Nervión',
        direccion:    'Avenida Luis Montoto, 35',
        localidad:    'Sevilla',
        provincia:    'Sevilla',
        codigoPostal: '41005',
        areaId:       area3.id,
        delegadoId:   delegado5.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Macarena',
        direccion:    'Calle San Luis, 8',
        localidad:    'Sevilla',
        provincia:    'Sevilla',
        codigoPostal: '41003',
        areaId:       area3.id,
        delegadoId:   delegado6.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Dos Hermanas',
        direccion:    'Avenida de la Libertad, 12',
        localidad:    'Dos Hermanas',
        provincia:    'Sevilla',
        codigoPostal: '41700',
        areaId:       area3.id,
        delegadoId:   delegado6.id,
      },
    }),

    // ── FARMACIAS CÓRDOBA ─────────────────────
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Cruz Conde',
        direccion:    'Calle Cruz Conde, 20',
        localidad:    'Córdoba',
        provincia:    'Córdoba',
        codigoPostal: '14001',
        areaId:       area4.id,
        delegadoId:   delegado7.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia El Brillante',
        direccion:    'Avenida del Brillante, 25',
        localidad:    'Córdoba',
        provincia:    'Córdoba',
        codigoPostal: '14012',
        areaId:       area4.id,
        delegadoId:   delegado7.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Lucena',
        direccion:    'Calle Calzada, 5',
        localidad:    'Lucena',
        provincia:    'Córdoba',
        codigoPostal: '14900',
        areaId:       area4.id,
        delegadoId:   delegado8.id,
      },
    }),
    prisma.establecimiento.create({
      data: {
        tipo:         'FARMACIA',
        nombre:       'Farmacia Puente Genil',
        direccion:    'Calle Lope de Vega, 3',
        localidad:    'Puente Genil',
        provincia:    'Córdoba',
        codigoPostal: '14500',
        areaId:       area4.id,
        delegadoId:   delegado8.id,
      },
    }),
  ]);
  console.log('  6 clínicas + 16 farmacias = 22 establecimientos creados');

  // ============================================
  // MARCAS
  // ============================================
  console.log('Creando marcas...');
  await Promise.all([
    prisma.marca.create({ data: { nombre: 'Natalben' } }),
    prisma.marca.create({ data: { nombre: 'Ovusitol' } }),
    prisma.marca.create({ data: { nombre: 'Neuralex' } }),
    prisma.marca.create({ data: { nombre: 'Oniria' } }),
    prisma.marca.create({ data: { nombre: 'Prodefen' } }),
    prisma.marca.create({ data: { nombre: 'Sinomarin' } }),
  ]);
  console.log('  6 marcas creadas');

  // ============================================
  // PROVEEDORES
  // ============================================
  console.log('Creando proveedores...');
  const [proveedor1, proveedor2] = await Promise.all([
    prisma.proveedor.create({
      data: {
        nombre:        'Gráficas Iberia S.L.',
        nif:           'B82001234',
        direccion:     'Polígono Industrial Las Mercedes, Nave 12',
        codigoPostal:  '28022',
        localidad:     'Madrid',
        telefono:      '912345678',
        contacto:      'Roberto Díaz',
        observaciones: 'Proveedor principal de material impreso. Plazo de entrega habitual: 10 días laborables.',
        emails: {
          create: [
            { email: 'pedidos@example.com',    tipo: 'DEFAULT'    },
            { email: 'produccion@example.com', tipo: 'PRODUCCION' },
          ],
        },
      },
    }),
    prisma.proveedor.create({
      data: {
        nombre:        'Textil Promo Europa S.A.',
        nif:           'A08009876',
        direccion:     'Carrer de la Indústria, 45',
        codigoPostal:  '08025',
        localidad:     'Barcelona',
        telefono:      '932109876',
        contacto:      'Montserrat Vidal',
        observaciones: 'Especialistas en batas y textil promocional. Plazo de entrega: 15 días laborables.',
        emails: {
          create: [
            { email: 'pedidos@example.com',    tipo: 'DEFAULT'    },
          ],
        },
      },
    }),
  ]);
  console.log('  2 proveedores creados');

  // ============================================
  // MATERIALES (con procesado de imágenes)
  // ============================================
  console.log('Procesando imágenes de materiales...');
  const [imgVinilo, imgBata, imgKit, imgRollUp] = await Promise.all([
    procesarImagenMaterial(IMG_SRC.vinilo),
    procesarImagenMaterial(IMG_SRC.bata),
    procesarImagenMaterial(IMG_SRC.kitPromocional),
    procesarImagenMaterial(IMG_SRC.rollUp),
  ]);

  console.log('Creando materiales...');
  await Promise.all([
    prisma.material.create({
      data: {
        codigo:              'MAT-1',
        nombre:              'Vinilo',
        descripcion:         'Vinilo adhesivo para escaparate. El delegado debe indicar las medidas en la solicitud.',
        precio:              5.00,
        precioPublico:       8.00,
        tipoPrecio:             'METRO2',
        permiteAltoAncho:       true,
        permitePersonalizar:    true,
        tipoEstablecimiento:    'FARMACIA',
        proveedorId:            proveedor1.id,
        imagen:              imgVinilo.imagen,
        imagenZoom:          imgVinilo.imagenZoom,
        thumbnail:           imgVinilo.thumbnail,
      },
    }),
    prisma.material.create({
      data: {
        codigo:                     'MAT-2',
        nombre:                     'Bata Farmacia',
        descripcion:                'Bata promocional para personal de farmacia con bordado de marca.',
        precio:                     7.00,
        precioPublico:              10.00,
        tipoPrecio:                 'UNIDAD',
        permiteTalla:               true,
        permitePersonalizacionBata: true,
        tipoEstablecimiento:        'FARMACIA',
        proveedorId:                proveedor2.id,
        imagen:                     imgBata.imagen,
        imagenZoom:                 imgBata.imagenZoom,
        thumbnail:                  imgBata.thumbnail,
      },
    }),
    prisma.material.create({
      data: {
        codigo:              'MAT-3',
        nombre:              'Kit Promocional',
        descripcion:         'Kit de material promocional. Sin especificaciones adicionales.',
        precio:              5.00,
        precioPublico:       7.00,
        tipoPrecio:          'UNIDAD',
        tipoEstablecimiento: 'CLINICA',
        proveedorId:         proveedor1.id,
        imagen:        imgKit.imagen,
        imagenZoom:    imgKit.imagenZoom,
        thumbnail:     imgKit.thumbnail,
      },
    }),
    prisma.material.create({
      data: {
        codigo:              'MAT-4',
        nombre:              'Roll Up',
        descripcion:         'Roll up publicitario. Siempre en formato vertical.',
        precio:              27.00,
        precioPublico:       30.00,
        tipoPrecio:          'UNIDAD',
        orientacion:         'VERTICAL',
        tipoEstablecimiento: 'EVENTO',
        proveedorId:         proveedor1.id,
        imagen:        imgRollUp.imagen,
        imagenZoom:    imgRollUp.imagenZoom,
        thumbnail:     imgRollUp.thumbnail,
      },
    }),
  ]);
  console.log('  4 materiales creados con imágenes');

  // ============================================
  // CONFIGURACION
  // ============================================
  console.log('Creando configuración...');
  await prisma.configuracion.create({
    data: {
      id:                  1,
      limiteAnualPorFarmacia: 50.00,
      soporteNombre:       'Alberto Sancho',
      soporteEmail:        'soporte@example.com',
      soporteTelefono:     '+34 600 000 000',
      appNombre:           'Material Farmacias',
      avisoActivo:         false,
      emailAdmin:          'admin@example.com',
    },
  });
  console.log('  Configuración creada');

  // ============================================
  // RESUMEN
  // ============================================
  console.log('\n════════════════════════════════════════');
  console.log('  Seed completado con éxito');
  console.log('════════════════════════════════════════');
  console.log('\nEstructura de datos:');
  console.log('\n  Gerencia Centro');
  console.log('    ├── Madrid Centro');
  console.log('    │     ├── gerente1  gerente@example.com           → Clínica Centro Madrid 1, Clínica Centro Madrid 2');
  console.log('    │     ├── delegado1 delegado@example.com          → Farmacia Mayor, Farmacia Gran Vía');
  console.log('    │     └── delegado2 delegado2@example.com         → Farmacia Fuencarral, Farmacia Retiro');
  console.log('    └── Madrid Periferia');
  console.log('          ├── gerente2  gerente2@example.com          → Clínica Getafe');
  console.log('          ├── delegado3 delegado3@example.com         → Farmacia Getafe Centro, Farmacia Leganés');
  console.log('          └── delegado4 delegado4@example.com         → Farmacia Alcobendas, Farmacia Alcalá de Henares');
  console.log('\n  Gerencia Sur');
  console.log('    ├── Sevilla');
  console.log('    │     ├── gerente3  gerente3@example.com          → Clínica Sevilla Centro, Clínica Sevilla Triana');
  console.log('    │     ├── delegado5 delegado5@example.com         → Farmacia Triana, Farmacia Nervión');
  console.log('    │     └── delegado6 delegado6@example.com         → Farmacia Macarena, Farmacia Dos Hermanas');
  console.log('    └── Córdoba');
  console.log('          ├── gerente4  gerente4@example.com          → Clínica Córdoba');
  console.log('          ├── delegado7 delegado7@example.com         → Farmacia Cruz Conde, Farmacia El Brillante');
  console.log('          └── delegado8 delegado8@example.com         → Farmacia Lucena, Farmacia Puente Genil');
  console.log('\nCredenciales (todas): password123');
  console.log('  admin@example.com             → ADMIN');
  console.log('  gerente@example.com           → GERENTE Madrid Centro');
  console.log('  gerente2@example.com          → GERENTE Madrid Periferia');
  console.log('  gerente3@example.com          → GERENTE Sevilla');
  console.log('  gerente4@example.com          → GERENTE Córdoba');
  console.log('  delegado@example.com          → DELEGADO Madrid Centro');
  console.log('  delegado2@example.com         → DELEGADO Madrid Centro');
  console.log('  delegado3@example.com         → DELEGADO Madrid Periferia');
  console.log('  delegado4@example.com         → DELEGADO Madrid Periferia');
  console.log('  delegado5@example.com         → DELEGADO Sevilla');
  console.log('  delegado6@example.com         → DELEGADO Sevilla');
  console.log('  delegado7@example.com         → DELEGADO Córdoba');
  console.log('  delegado8@example.com         → DELEGADO Córdoba');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
