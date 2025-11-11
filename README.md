# 🏥 Sistema de Gestión de Citas Médicas

## 🎓 Información del Proyecto
- **Instituto Tecnológico de Ensenada
- **Ingenieria en sistemas computacionales
- **Desarrollo de APIs 
- **LABORATORIO APIS - EVALUACIÓN
- ** Alejandra Rodríguez de la Cruz
- **Docente:** Xenia Padilla Madrid
- **Fecha:** 11 Noviembre 2025

## 📋 Descripción
API REST para gestión de citas médicas con persistencia en JSON. Permite registrar pacientes, doctores y agendar citas con validaciones completas.

## 🚀 Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone [https://github.com/AleRodriguezCruz/LABORATORIO-APIS---EVALUACI-N.git](https://github.com/AleRodriguezCruz/LABORATORIO-APIS---EVALUACI-N.git)

# 2. Entrar al directorio
cd LABORATORIO-APIS---EVALUACI-N

# 3. Instalar dependencias
npm install

# 4. Ejecutar servidor
npm run dev

# 5. Probar (en otra terminal)
curl http://localhost:3000/

## 📚 Endpoints Principales

### 👥 Pacientes

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| POST | `/pacientes` | Registrar nuevo paciente |
| GET | `/pacientes` | Listar todos los pacientes |
| GET | `/pacientes/:id` | Obtener paciente por ID |
| PUT | `/pacientes/:id` | Actualizar datos del paciente |
| GET | `/pacientes/:id/historial` | Ver historial de citas |

### 🩺 Doctores

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| POST | `/doctores` | Registrar nuevo doctor |
| GET | `/doctores` | Listar todos los doctores |
  GET | `/doctores/:id` | Obtener doctor por ID |
  GET | `/doctores/especialidad/:especialidad` | Buscar por especialidad |

### 📅 Citas

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| POST | /citas|	Agendar nueva cita|
| GET  | /citas	||Listar citas (con filtros)|
| GET  |/citas/:id|	|Obtener cita por ID|
| PUT  |/citas/:id/cancelar|	Cancelar cita|
| GET  |/citas/doctor/:doctorId|	Agenda del doctor|

### 📅 Citas

| Método | Endpoint | Descripción |
| :--- | :--- | :--- |
| GET | /estadisticas/doctores|	Ver estadísticas de citas por doctor|
| GET  | //estadisticas/especialidades	|Ver estadísticas de citas por especialidad|

##🧪 Ejemplos de Uso
#Crear Paciente
bash
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl -X POST http://localhost:3000/pacientes -H "Content-Type: application/json" -d "{\"nombre\":\"Juan Sebastian\",\"edad\":25,\"telefono\":\"646-TEST\",\"email\":\"al22760045@ite.edu.com\"}"
{"success":true,"message":"Paciente registrado exitosamente","data":{"id":"P003","nombre":"Juan Sebastian","edad":25,"telefono":"646-TEST","email":"al22760045@ite.edu.com","fechaRegistro":"2025-11-10"}}"

##Agendar Cita
bash
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl -X POST http://localhost:3000/citas -H "Content-Type: application/json" -d "{\"pacienteId\":\"P001\",\"doctorId\":\"D002\",\"fecha\":\"2025-12-11\",\"hora\":\"14:00\",\"motivo\":\"Caso diagnóstico complejo\"}"
{"success":true,"message":"Cita agendada exitosamente","data":{"id":"C002","pacienteId":"P001","doctorId":"D002","fecha":"2025-12-11","hora":"14:00","motivo":"Caso diagnóstico complejo","estado":"programada"}}"

##Agregar Doctor
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl -X POST http://localhost:3000/citas -H "Content-Type: application/json" -d "{\"pacienteId\":\"P001\",\"doctorId\":\"D002\",\"fecha\":\"2025-12-11\",\"hora\":\"14:00\",\"motivo\":\"Caso diagnóstico complejo\"}"
{"success":true,"message":"Cita agendada exitosamente","data":{"id":"C002","pacienteId":"P001","doctorId":"D002","fecha":"2025-12-11","hora":"14:00","motivo":"Caso diagnóstico complejo","estado":"programada"}}"

## Validaciones Comprobadas

# Email duplicado
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl -X POST http://localhost:3000/pacientes -H "Content-Type: application/json" -d "{\"nombre\":\"Juan Duplicado\",\"edad\":30,\"telefono\":\"555-9999\",\"email\":\"ana.lopez@email.com\"}"
{"success":false,"message":"Ya existe un paciente con este email"}

# Dr. House no trabaja martes
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl -X POST http://localhost:3000/citas -H "Content-Type: application/json" -d "{\"pacienteId\":\"P001\",\"doctorId\":\"D002\",\"fecha\":\"2025-12-12\",\"hora\":\"14:00\",\"motivo\":\"Consulta martes\"}"
{"success":false,"message":"El doctor no trabaja los Juevess"}

# Cita duplicada mismo horario
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl -X POST http://localhost:3000/citas -H "Content-Type: application/json" -d "{\"pacienteId\":\"P001\",\"doctorId\":\"D003\",\"fecha\":\"2025-11-15\",\"hora\":\"11:00\",\"motivo\":\"Revision general\"}"
{"success":false,"message":"El doctor ya tiene una cita programada en este horario"}

# Ver todos los pacientes
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl http://localhost:3000/pacientes
{"success":true,"data":[{"id":"P001","nombre":"Ana López","edad":28,"telefono":"555-1001","email":"ana.lopez@email.com","fechaRegistro":"2024-03-20"},{"id":"P002","nombre":"Carlos Ruiz","edad":45,"telefono":"555-1002","email":"carlos.ruiz@email.com","fechaRegistro":"2024-03-20"},{"id":"P003","nombre":"Juan Sebastian","edad":25,"telefono":"646-TEST","email":"al22760045@ite.edu.com","fechaRegistro":"2025-11-10"}]}

# Historial de Ana López
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl http://localhost:3000/pacientes/P001/historial
{"success":true,"data":{"paciente":{"id":"P001","nombre":"Ana López","edad":28,"telefono":"555-1001","email":"ana.lopez@email.com","fechaRegistro":"2024-03-20"},"historial":[{"id":"C001","pacienteId":"P001","doctorId":"D001","fecha":"2025-11-10","hora":"10:00","motivo":"Revisión general","estado":"cancelada"},{"id":"C002","pacienteId":"P001","doctorId":"D003","fecha":"2025-11-14","hora":"11:00","motivo":"Consulta oncológica y seguimiento de tratamiento","estado":"programada"},{"id":"C003","pacienteId":"P001","doctorId":"D002","fecha":"2025-11-11","hora":"11:00","motivo":"Dr. House martes","estado":"programada"},{"id":"C004","pacienteId":"P001","doctorId":"D004","fecha":"2025-11-13","hora":"09:00","motivo":"Evaluación inmunológica","estado":"programada"},{"id":"C006","pacienteId":"P001","doctorId":"D003","fecha":"2025-11-15","hora":"11:00","motivo":"Consulta sábado - debe fallar","estado":"programada"}]}}"

# Buscar doctores por especialidad
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl http://localhost:3000/doctores/especialidad/Oncología
{"success":true,"data":[{"id":"D003","nombre":"Dr. James Wilson","especialidad":"Oncología","horarioInicio":"09:00","horarioFin":"17:00","diasDisponibles":["Lunes","Martes","Jueves","Viernes"]}]}
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>

C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl http://localhost:3000/doctores/especialidad/Cardiología
{"success":true,"data":[{"id":"D001","nombre":"Dr. Carlos Méndez","especialidad":"Cardiología","horarioInicio":"09:00","horarioFin":"17:00","diasDisponibles":["Lunes","Martes","Miércoles","Jueves","Viernes"]}]}"

# Estadísticas
C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl http://localhost:3000/estadisticas/doctores
{"success":true,"data":{"doctor":"Dr. James Wilson","especialidad":"Oncología","totalCitas":2}}

C:\Users\alejandrarodriguez\Downloads\gestion-citas-medicas>curl http://localhost:3000/estadisticas/especialidades
{"success":true,"data":{"especialidad":"Oncología","totalCitas":2}}

curl http://localhost:3000/estadisticas/doctores

curl http://localhost:3000/estadisticas/especialidades
