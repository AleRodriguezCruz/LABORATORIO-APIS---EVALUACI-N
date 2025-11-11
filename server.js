const express = require('express');
const FileManager = require('./utils/fileManager');

const app = express();
const PORT = 3000;

app.use(express.json());

// Inicializar de archivos
const pacienteManager = new FileManager('pacientes.json');
const doctorManager = new FileManager('doctores.json');
const citaManager = new FileManager('citas.json');
 
// 📍 validar pacientes 
const validarPaciente = (req, res, next) => {
  const { nombre, edad, telefono, email } = req.body;
  
  // 1. Campos obligatorios
  if (!nombre || !edad || !telefono || !email) {
    return res.status(400).json({ 
      success: false, 
      message: 'Todos los campos son obligatorios: nombre, edad, telefono, email' 
    });
  }

  // 2. Validación de edad
  const edadNumero = parseInt(edad);
  if (isNaN(edadNumero)) {
    return res.status(400).json({ 
      success: false, 
      message: 'La edad debe ser un número válido' 
    });
  }
  
  if (edadNumero <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'La edad debe ser mayor a 0' 
    });
  }

  // 3. Formato de email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'El formato del email no es válido' 
    });
  }

  // 4. Email único
  const pacientes = pacienteManager.leerDatos();
  const pacienteExistente = pacientes.find(p => p.email === email);
  if (pacienteExistente) {
    return res.status(400).json({ 
      success: false, 
      message: 'Ya existe un paciente con este email' 
    });
  }

  next();
};

const validarDoctor = (req, res, next) => {
  const { nombre, especialidad, horarioInicio, horarioFin, diasDisponibles } = req.body;
  
  if (!nombre || !especialidad || !horarioInicio || !horarioFin || !diasDisponibles) {
    return res.status(400).json({ 
      success: false, 
      message: 'Todos los campos son obligatorios' 
    });
  }

  if (horarioInicio >= horarioFin) {
    return res.status(400).json({ 
      success: false, 
      message: 'El horario de inicio debe ser menor al horario de fin' 
    });
  }

  if (!Array.isArray(diasDisponibles) || diasDisponibles.length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Debe especificar al menos un día disponible' 
    });
  }

  // verificar doctor único
  const doctores = doctorManager.leerDatos();
  const doctorExistente = doctores.find(d => 
    d.nombre === nombre && d.especialidad === especialidad
  );
  if (doctorExistente) {
    return res.status(400).json({ 
      success: false, 
      message: 'Ya existe un doctor con este nombre y especialidad' 
    });
  }

  next();
};

const validarCita = (req, res, next) => {
  const { pacienteId, doctorId, fecha, hora, motivo } = req.body;
  
  if (!pacienteId || !doctorId || !fecha || !hora || !motivo) {
    return res.status(400).json({ 
      success: false, 
      message: 'Todos los campos son obligatorios' 
    });
  }

  // verificar que el paciente existe
  const pacientes = pacienteManager.leerDatos();
  const paciente = pacientes.find(p => p.id === pacienteId);
  if (!paciente) {
    return res.status(404).json({ 
      success: false, 
      message: 'Paciente no encontrado' 
    });
  }

  // Verificar que el doctor existe
  const doctores = doctorManager.leerDatos();
  const doctor = doctores.find(d => d.id === doctorId);
  if (!doctor) {
    return res.status(404).json({ 
      success: false, 
      message: 'Doctor no encontrado' 
    });
  }

  // Verificar fecha futura
  const fechaCita = new Date(fecha);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (fechaCita < hoy) {
    return res.status(400).json({ 
      success: false, 
      message: 'La cita debe ser en una fecha futura' 
    });
  }

  // Verificar día disponible del doctor
  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaCita = diasSemana[fechaCita.getDay()];
  if (!doctor.diasDisponibles.includes(diaCita)) {
    return res.status(400).json({ 
      success: false, 
      message: `El doctor no trabaja los ${diaCita}s` 
    });
  }

  // verificar horario del doctor
  const [horaCita, minutoCita] = hora.split(':').map(Number);
  const [inicioH, inicioM] = doctor.horarioInicio.split(':').map(Number);
  const [finH, finM] = doctor.horarioFin.split(':').map(Number);
  
  const horaCitaMinutos = horaCita * 60 + minutoCita;
  const inicioMinutos = inicioH * 60 + inicioM;
  const finMinutos = finH * 60 + finM;
  
  if (horaCitaMinutos < inicioMinutos || horaCitaMinutos >= finMinutos) {
    return res.status(400).json({ 
      success: false, 
      message: `El doctor solo atiende de ${doctor.horarioInicio} a ${doctor.horarioFin}` 
    });
  }

  // Verificar disponibilidad de horario
  const citas = citaManager.leerDatos();
  const citaExistente = citas.find(c => 
    c.doctorId === doctorId && 
    c.fecha === fecha && 
    c.hora === hora &&
    c.estado !== 'cancelada'
  );
  if (citaExistente) {
    return res.status(400).json({ 
      success: false, 
      message: 'El doctor ya tiene una cita programada en este horario' 
    });
  }

  req.paciente = paciente;
  req.doctor = doctor;
  next();
};

// 🏠 ENDPOINT RAIZ
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: ' Sistema de Gestión de Citas Médicas !',
    endpoints: {
      pacientes: [
        'POST /pacientes - Registrar nuevo paciente',
        'GET /pacientes - Listar todos los pacientes', 
        'GET /pacientes/:id - Obtener paciente por ID',
        'PUT /pacientes/:id - Actualizar datos del paciente',
        'GET /pacientes/:id/historial - Ver historial de citas del paciente'
      ],
      doctores: [
        'POST /doctores - Registrar nuevo doctor',
        'GET /doctores - Listar todos los doctores',
        'GET /doctores/:id - Obtener doctor por ID',
        'GET /doctores/especialidad/:especialidad - Buscar doctores por especialidad'
      ],
      citas: [
        'POST /citas - Agendar nueva cita',
        'GET /citas - Listar todas las citas (con filtros opcionales por fecha)',
        'GET /citas/:id - Obtener cita por ID',
        'PUT /citas/:id/cancelar - Cancelar una cita',
        'GET /citas/doctor/:doctorId - Ver agenda de un doctor'
      ],
      estadisticas: [
        'GET /estadisticas/doctores - Doctor con más citas',
        'GET /estadisticas/especialidades - Especialidad más solicitada'
      ],
      busquedas: [
        'GET /doctores/disponibles - Doctores disponibles por fecha/hora',
        'GET /citas/proximas - Citas próximas (24 horas)'
      ]
    }
  });
});

// 🏥 ENDPOINTS PACIENTES

// POST /pacientes - Registrar nuevo paciente
app.post('/pacientes', validarPaciente, (req, res) => {
  const pacientes = pacienteManager.leerDatos();
  const nuevoPaciente = {
    id: pacienteManager.generarId('P', pacientes),
    ...req.body,
    fechaRegistro: new Date().toISOString().split('T')[0]
  };
  
  pacientes.push(nuevoPaciente);
  pacienteManager.escribirDatos(pacientes);
  
  res.status(201).json({
    success: true,
    message: 'Paciente registrado exitosamente',
    data: nuevoPaciente
  });
});

// GET /pacientes - Listar todos los pacientes
app.get('/pacientes', (req, res) => {
  const pacientes = pacienteManager.leerDatos();
  res.json({
    success: true,
    data: pacientes
  });
});

// GET /pacientes/:id - Obtener paciente por ID
app.get('/pacientes/:id', (req, res) => {
  const pacientes = pacienteManager.leerDatos();
  const paciente = pacientes.find(p => p.id === req.params.id);
  
  if (!paciente) {
    return res.status(404).json({
      success: false,
      message: 'Paciente no encontrado'
    });
  }
  
  res.json({
    success: true,
    data: paciente
  });
});

// PUT /pacientes/:id - Actualizar datos del paciente
app.put('/pacientes/:id', (req, res) => {
  const pacientes = pacienteManager.leerDatos();
  const index = pacientes.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Paciente no encontrado'
    });
  }
  
  pacientes[index] = { ...pacientes[index], ...req.body };
  pacienteManager.escribirDatos(pacientes);
  
  res.json({
    success: true,
    message: 'Paciente actualizado exitosamente',
    data: pacientes[index]
  });
});

// GET /pacientes/:id/historial - Ver historial de citas del paciente
app.get('/pacientes/:id/historial', (req, res) => {
  const pacientes = pacienteManager.leerDatos();
  const paciente = pacientes.find(p => p.id === req.params.id);
  
  if (!paciente) {
    return res.status(404).json({
      success: false,
      message: 'Paciente no encontrado'
    });
  }
  
  const citas = citaManager.leerDatos();
  const historial = citas.filter(c => c.pacienteId === req.params.id);
  
  res.json({
    success: true,
    data: {
      paciente,
      historial
    }
  });
});

// 🩺 ENDPOINTS DOCTORES

// POST /doctores - Registrar nuevo doctor
app.post('/doctores', validarDoctor, (req, res) => {
  const doctores = doctorManager.leerDatos();
  const nuevoDoctor = {
    id: doctorManager.generarId('D', doctores),
    ...req.body
  };
  
  doctores.push(nuevoDoctor);
  doctorManager.escribirDatos(doctores);
  
  res.status(201).json({
    success: true,
    message: 'Doctor registrado exitosamente',
    data: nuevoDoctor
  });
});

// GET /doctores - Listar todos los doctores
app.get('/doctores', (req, res) => {
  const doctores = doctorManager.leerDatos();
  res.json({
    success: true,
    data: doctores
  });
});

// GET /doctores/:id - Obtener doctor por ID
app.get('/doctores/:id', (req, res) => {
  const doctores = doctorManager.leerDatos();
  const doctor = doctores.find(d => d.id === req.params.id);
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor no encontrado'
    });
  }
  
  res.json({
    success: true,
    data: doctor
  });
});

// GET /doctores/especialidad/:especialidad - Buscar doctores por especialidad
app.get('/doctores/especialidad/:especialidad', (req, res) => {
  const doctores = doctorManager.leerDatos();
  const doctoresEspecialidad = doctores.filter(d => 
    d.especialidad.toLowerCase() === req.params.especialidad.toLowerCase()
  );
  
  res.json({
    success: true,
    data: doctoresEspecialidad
  });
});

// 📅 ENDPOINTS CITAS

// POST /citas - Agendar nueva cita
app.post('/citas', validarCita, (req, res) => {
  const citas = citaManager.leerDatos();
  const nuevaCita = {
    id: citaManager.generarId('C', citas),
    ...req.body,
    estado: 'programada'
  };
  
  citas.push(nuevaCita);
  citaManager.escribirDatos(citas);
  
  res.status(201).json({
    success: true,
    message: 'Cita agendada exitosamente',
    data: nuevaCita
  });
});

// GET /citas - Listar todas las citas (con filtros opcionales)
app.get('/citas', (req, res) => {
  let citas = citaManager.leerDatos();
  const { fecha, estado } = req.query;
  
  if (fecha) {
    citas = citas.filter(c => c.fecha === fecha);
  }
  
  if (estado) {
    citas = citas.filter(c => c.estado === estado);
  }
  
  res.json({
    success: true,
    data: citas
  });
});

// GET /citas/:id - Obtener cita por ID
app.get('/citas/:id', (req, res) => {
  const citas = citaManager.leerDatos();
  const cita = citas.find(c => c.id === req.params.id);
  
  if (!cita) {
    return res.status(404).json({
      success: false,
      message: 'Cita no encontrada'
    });
  }
  
  res.json({
    success: true,
    data: cita
  });
});

// PUT /citas/:id/cancelar - Cancelar una cita
app.put('/citas/:id/cancelar', (req, res) => {
  const citas = citaManager.leerDatos();
  const index = citas.findIndex(c => c.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Cita no encontrada'
    });
  }
  
  if (citas[index].estado !== 'programada') {
    return res.status(400).json({
      success: false,
      message: 'Solo se pueden cancelar citas programadas'
    });
  }
  
  citas[index].estado = 'cancelada';
  citaManager.escribirDatos(citas);
  
  res.json({
    success: true,
    message: 'Cita cancelada exitosamente',
    data: citas[index]
  });
});

// GET /citas/doctor/:doctorId - ver agenda de un doctor
app.get('/citas/doctor/:doctorId', (req, res) => {
  const doctores = doctorManager.leerDatos();
  const doctor = doctores.find(d => d.id === req.params.doctorId);
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: 'Doctor no encontrado'
    });
  }
  
  const citas = citaManager.leerDatos();
  const agendaDoctor = citas.filter(c => 
    c.doctorId === req.params.doctorId && 
    c.estado === 'programada'
  );
  
  res.json({
    success: true,
    data: {
      doctor,
      agenda: agendaDoctor
    }
  });
});

// 📊 ENDPOINTS ESTADÍSTICAS

// GET /estadisticas/doctores - Doctor con más citas
app.get('/estadisticas/doctores', (req, res) => {
  const doctores = doctorManager.leerDatos();
  const citas = citaManager.leerDatos();
  
  const citasPorDoctor = doctores.map(doctor => {
    const citasDoctor = citas.filter(c => 
      c.doctorId === doctor.id && c.estado !== 'cancelada'
    );
    return {
      doctor: doctor.nombre,
      especialidad: doctor.especialidad,
      totalCitas: citasDoctor.length
    };
  }).sort((a, b) => b.totalCitas - a.totalCitas);
  
  res.json({
    success: true,
    data: citasPorDoctor[0] || {}
  });
});

// GET /estadisticas/especialidades - Especialidad más solicitada
app.get('/estadisticas/especialidades', (req, res) => {
  const doctores = doctorManager.leerDatos();
  const citas = citaManager.leerDatos();
  
  const especialidadesCount = {};
  
  citas.forEach(cita => {
    if (cita.estado !== 'cancelada') {
      const doctor = doctores.find(d => d.id === cita.doctorId);
      if (doctor) {
        especialidadesCount[doctor.especialidad] = 
          (especialidadesCount[doctor.especialidad] || 0) + 1;
      }
    }
  });
  
  const especialidadMasSolicitada = Object.entries(especialidadesCount)
    .sort(([,a], [,b]) => b - a)[0] || ['', 0];
  
  res.json({
    success: true,
    data: {
      especialidad: especialidadMasSolicitada[0],
      totalCitas: especialidadMasSolicitada[1]
    }
  });
});

// 🔍 ENDPOINTS BÚSQUEDAS AVANZADAS

// GET /doctores/disponibles - Buscar doctores disponibles en fecha y hora
app.get('/doctores/disponibles', (req, res) => {
  const { fecha, hora } = req.query;
  
  if (!fecha || !hora) {
    return res.status(400).json({
      success: false,
      message: 'Se requieren los parámetros fecha y hora'
    });
  }
  
  const doctores = doctorManager.leerDatos();
  const citas = citaManager.leerDatos();
  
  const doctoresDisponibles = doctores.filter(doctor => {
    // Verificar día disponible
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fechaObj = new Date(fecha);
    const diaCita = diasSemana[fechaObj.getDay()];
    
    if (!doctor.diasDisponibles.includes(diaCita)) {
      return false;
    }
    
    // Verificar horario
    const [horaCita, minutoCita] = hora.split(':').map(Number);
    const [inicioH, inicioM] = doctor.horarioInicio.split(':').map(Number);
    const [finH, finM] = doctor.horarioFin.split(':').map(Number);
    
    const horaCitaMinutos = horaCita * 60 + minutoCita;
    const inicioMinutos = inicioH * 60 + inicioM;
    const finMinutos = finH * 60 + finM;
    
    if (horaCitaMinutos < inicioMinutos || horaCitaMinutos >= finMinutos) {
      return false;
    }
    
    // Verificar si ya tiene cita en ese horario
    const citaExistente = citas.find(c => 
      c.doctorId === doctor.id && 
      c.fecha === fecha && 
      c.hora === hora &&
      c.estado !== 'cancelada'
    );
    
    return !citaExistente;
  });
  
  res.json({
    success: true,
    data: doctoresDisponibles
  });
});

// GET /citas/proximas - Obtener citas próximas (siguientes 24 horas)
app.get('/citas/proximas', (req, res) => {
  const citas = citaManager.leerDatos();
  const ahora = new Date();
  const mañana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);
  
  const citasProximas = citas.filter(cita => {
    if (cita.estado !== 'programada') return false;
    
    const fechaCita = new Date(`${cita.fecha}T${cita.hora}`);
    return fechaCita > ahora && fechaCita <= mañana;
  });
  
  res.json({
    success: true,
    data: citasProximas
  });
});

// ❌ MANEJO DE ERRORES
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado'
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// 🚀 INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log('📋 Endpoints disponibles:');
  console.log('  GET  / - Información del sistema');
  console.log('  POST /pacientes - Crear paciente');
  console.log('  GET  /pacientes - Listar pacientes');
  console.log('  GET  /pacientes/:id - Obtener paciente específico');
  console.log('  PUT  /pacientes/:id - Actualizar paciente');
  console.log('  GET  /pacientes/:id/historial - Historial de citas');
  console.log('  POST /doctores - Crear doctor');
  console.log('  GET  /doctores - Listar doctores');
  console.log('  GET  /doctores/:id - Obtener doctor específico');
  console.log('  GET  /doctores/especialidad/:especialidad - Buscar por especialidad');
  console.log('  POST /citas - Agendar cita');
  console.log('  GET  /citas - Listar citas');
  console.log('  GET  /citas/:id - Obtener cita específica');
  console.log('  PUT  /citas/:id/cancelar - Cancelar cita');
  console.log('  GET  /citas/doctor/:doctorId - Agenda del doctor');
  console.log('  GET  /estadisticas/doctores - Doctor con más citas');
  console.log('  GET  /estadisticas/especialidades - Especialidad más solicitada');
  console.log('  GET  /doctores/disponibles - Doctores disponibles');
  console.log('  GET  /citas/proximas - Citas próximas');
});