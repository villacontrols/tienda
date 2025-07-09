<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Descripción

Repositorio base de [Nest](https://github.com/nestjs/nest) framework TypeScript con integración de base de datos PostgreSQL.

## Requisitos Previos

Antes de instalar la aplicación, asegúrate de tener lo siguiente instalado en tu sistema:

- **Node.js** (versión 16 o superior)
- **npm** o **yarn**
- **PostgreSQL** (versión 12 o superior)

## Instalación Paso a Paso

### 1. Instalar Base de Datos PostgreSQL

#### En Windows:
1. Descarga PostgreSQL desde [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Ejecuta el instalador y sigue el asistente de configuración
3. Establece una contraseña para el usuario `postgres` (usa `imperio` como se especifica en el .env)
4. Anota el puerto (por defecto es 5432)

#### En macOS:
```bash
# Usando Homebrew
brew install postgresql
brew services start postgresql

# Crear usuario postgres si es necesario
createuser -s postgres
```

#### En Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Establecer contraseña para el usuario postgres
sudo -u postgres psql
ALTER USER postgres PASSWORD 'imperio';
\q
```

### 2. Crear Base de Datos

Conéctate a PostgreSQL y crea la base de datos:

```bash
# Conectar a PostgreSQL
psql -U postgres -h localhost

# Crear la base de datos
CREATE DATABASE tienda;

# Salir de PostgreSQL
\q
```

### 3. Clonar y Configurar la Aplicación

```bash
# Clonar el repositorio (reemplaza con la URL real de tu repositorio)
git clone <url-de-tu-repositorio>
cd <nombre-de-tu-proyecto>

# Instalar dependencias
npm install
```

### 4. Configuración de Variables de Entorno

Crea un archivo `.env` en el directorio raíz de tu proyecto con el siguiente contenido:

```env
# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=imperio
DB_NAME=tienda

# Configuración JWT
JWT_SECRET=secrettienda2025
JWT_EXPIRES_IN=24h
TOKEN_SECRET=token2025
JWT_REFRESH_SECRET=refresh2025

# Configuración de Aplicación
PORT=3000
NODE_ENV=development
```

**Importante:** Nunca subas el archivo `.env` a tu repositorio. Asegúrate de que esté incluido en tu archivo `.gitignore`.

### 5. Configuración de Base de Datos (si usas migraciones)

Si tu aplicación usa migraciones de TypeORM, ejecuta:

```bash
# Generar migración (si es necesario)
npm run migration:generate

# Ejecutar migraciones
npm run migration:run
```

### 6. Verificar Conexión a Base de Datos

Prueba que tu aplicación pueda conectarse a la base de datos:

```bash
# Iniciar la aplicación en modo desarrollo
npm run start:dev
```

Si todo está configurado correctamente, deberías ver mensajes de conexión exitosa en la consola.

## Configuración del Proyecto

```bash
$ npm install
```

## Compilar y ejecutar el proyecto

```bash
# desarrollo
$ npm run start

# modo watch
$ npm run start:dev

# modo producción
$ npm run start:prod
```

## Ejecutar pruebas

```bash
# pruebas unitarias
$ npm run test

# pruebas e2e
$ npm run test:e2e

# cobertura de pruebas
$ npm run test:cov
```

## Solución de Problemas

### Problemas de Conexión a Base de Datos

1. **Conexión rechazada**: Asegúrate de que PostgreSQL esté ejecutándose
   ```bash
   # Verificar si PostgreSQL está ejecutándose
   sudo systemctl status postgresql  # Linux
   brew services list | grep postgresql  # macOS
   ```

2. **Fallo de autenticación**: Verifica que la contraseña en tu archivo `.env` coincida con la contraseña del usuario PostgreSQL

3. **Base de datos no existe**: Asegúrate de haber creado la base de datos `tienda` como se muestra en el paso 2

4. **Puerto ya en uso**: Si el puerto 3000 está ocupado, cambia el PORT en tu archivo `.env`

### Comandos Útiles

```bash
# Verificar versión de PostgreSQL
psql --version

# Conectar directamente a la base de datos
psql -U postgres -h localhost -d tienda

# Reiniciar servicio PostgreSQL
sudo systemctl restart postgresql  # Linux
brew services restart postgresql   # macOS
```

## Despliegue

Cuando estés listo para desplegar tu aplicación NestJS a producción, hay algunos pasos clave que puedes seguir para asegurar que funcione de la manera más eficiente posible. Consulta la [documentación de despliegue](https://docs.nestjs.com/deployment) para más información.

Si estás buscando una plataforma basada en la nube para desplegar tu aplicación NestJS, echa un vistazo a [Mau](https://mau.nestjs.com), nuestra plataforma oficial para desplegar aplicaciones NestJS en AWS. Mau hace que el despliegue sea directo y rápido, requiriendo solo unos pocos pasos simples:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

Con Mau, puedes desplegar tu aplicación en solo unos clics, permitiéndote enfocarte en construir características en lugar de administrar infraestructura.

# Comandos de Docker
bash# Construir y ejecutar con Docker Compose
docker-compose up --build

# Ejecutar en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener los contenedores
docker-compose down

# Detener y eliminar volúmenes (cuidado: elimina los datos de la DB)
docker-compose down -v
5. Variables de Entorno para Producción
Para producción, es recomendable usar un archivo .env.production:
env# Configuración de Base de Datos
DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=imperio_produccion_segura
DB_NAME=tienda

# Configuración JWT (usar secretos más seguros)
JWT_SECRET=secreto_super_seguro_produccion_2025
JWT_EXPIRES_IN=24h
TOKEN_SECRET=token_produccion_2025
JWT_REFRESH_SECRET=refresh_produccion_2025

# Configuración de Aplicación
PORT=3000
NODE_ENV=production
6. Comandos Útiles de Docker
bash# Ver contenedores ejecutándose
docker ps

# Conectar a la base de datos PostgreSQL en Docker
docker exec -it tienda_postgres psql -U postgres -d tienda

# Ver logs de la aplicación
docker logs tienda_app

# Reiniciar solo la aplicación
docker-compose restart app

# Ejecutar migraciones en el contenedor
docker-compose exec app npm run migration:run

# Acceder al contenedor de la aplicación
docker exec -it tienda_app sh
7. Consideraciones de Producción

Seguridad: Cambia todas las contraseñas y secretos por valores seguros
Volúmenes: Los datos de PostgreSQL se mantienen en un volumen persistente
Redes: La aplicación y la base de datos están en una red privada
Monitoreo: Considera agregar herramientas como Grafana o Prometheus
Backup: Implementa estrategias de respaldo para la base de datos

## Recursos

Consulta algunos recursos que pueden ser útiles cuando trabajes con NestJS:

- Visita la [Documentación de NestJS](https://docs.nestjs.com) para aprender más sobre el framework.
- Para preguntas y soporte, visita nuestro [canal de Discord](https://discord.gg/G7Qnnhy).
- Para profundizar y obtener más experiencia práctica, echa un vistazo a nuestros [cursos](https://courses.nestjs.com/) oficiales en video.
- Despliega tu aplicación a AWS con la ayuda de [NestJS Mau](https://mau.nestjs.com) en solo unos clics.
- Visualiza el gráfico de tu aplicación e interactúa con la aplicación NestJS en tiempo real usando [NestJS Devtools](https://devtools.nestjs.com).
- ¿Necesitas ayuda con tu proyecto (medio tiempo a tiempo completo)? Consulta nuestro [soporte empresarial](https://enterprise.nestjs.com) oficial.
- Para mantenerte informado y recibir actualizaciones, síguenos en [X](https://x.com/nestframework) y [LinkedIn](https://linkedin.com/company/nestjs).
- ¿Buscas trabajo o tienes una oferta laboral? Consulta nuestro [tablero de empleos](https://jobs.nestjs.com) oficial.

## Soporte

Nest es un proyecto de código abierto con licencia MIT. Puede crecer gracias a los patrocinadores y el apoyo de los increíbles respaldadores. Si te gustaría unirte a ellos, por favor [lee más aquí](https://docs.nestjs.com/support).

## Mantente en Contacto

- Autor - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Sitio Web - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## Licencia

Nest tiene [licencia MIT](https://github.com/nestjs/nest/blob/master/LICENSE).