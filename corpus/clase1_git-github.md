## Instalaciones
- Git
```bash
sudo apt update
sudo apt install git -y
git --version  # verifica la instalación
```
- fnm
```bash
# WSL
curl -fsSL https://fnm.vercel.app/install | bash

# Luego agregá esta línea al final de tu `~/.bashrc` (o `~/.zshrc` si usás zsh):
eval "$(fnm env --use-on-cd --shell bash)"

# Powershell
winget install Schniz.fnm
notepad $PROFILE
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```
- pnpm
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```
## Síntesis

Git es un sistema de control de versiones distribuido que permite gestionar y rastrear cambios en el código fuente. GitHub, por otro lado, es una plataforma basada en la nube que permite alojar **repositorios** Git, facilitando la colaboración y el control de versiones en equipo.
## Configuración inicial

### Configuración local

Una vez instalado, configurar los datos del usuario es esencial para que Git pueda registrar quién realiza los cambios:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tuemail@ejemplo.com"
```

### Comprobación de la configuración

Verifica tu configuración usando:

```bash
git config --list
```

## 🔐 Crear una llave SSH

### Generar una nueva llave SSH

Para crear una llave SSH, utiliza el siguiente comando en la terminal:

```bash
ssh-keygen -t ed25519 -C "email@example.com"
```

### Explicación del comando

- `ssh-keygen`: Comando para generar una nueva clave SSH.
- `-t ed25519`: Especifica el tipo de clave (Ed25519 es más seguro y recomendado).
- `-C "email@example.com"`: Agrega un comentario identificador (normalmente tu correo electrónico).

### Verificar si ya tienes una llave SSH

Antes de generar una nueva llave, es recomendable comprobar si ya existe una en tu sistema con el siguiente comando:

```bash
ls -al ~/.ssh
```

Si este comando muestra archivos como `id_ed25519` y `id_ed25519.pub`, significa que ya tenemos una llave creada.
### ⚠️ Importante

✅ **Solo necesitas una llave SSH por PC**. No es necesario generar más de una.

📢 **Después de generar la llave**, recuerda añadirla a tu servicio (GitHub, GitLab, servidores, etc.). Podemos copiar la clave pública con:

```bash
cat ~/.ssh/id_ed25519.pub
```

🔗 Luego, pégala en la configuración de SSH de tu servicio.
## Conceptos clave

### Commits

Un **commit** representa un conjunto de cambios confirmados en el historial del repositorio. Cada commit tiene un identificador único (hash)

[Coventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

**Ejemplo**:

```bash
git init # Inicializa un nuevo repositorio
touch archivo.txt
echo "Hola Mundo" > archivo.txt
git add archivo.txt
git commit -m "Añade archivo de saludo" # Crea un commit con el cambio
```

### Stage (Área de preparación)

El **staging area** es un espacio intermedio donde se añaden cambios antes de hacer un commit.

**Ejemplo**:

```bash
echo "Nuevo contenido" >> archivo.txt
git status # Muestra cambios no rastreados
git add archivo.txt # Mueve los cambios al área de preparación
git status # Ahora los cambios están en el área de preparación
```

### Branches (Ramas)

Las ramas permiten desarrollar nuevas características sin afectar la rama principal (_main_ o _master_).

**Ejemplo**:

```bash
git branch nueva-funcionalidad # Crea una nueva rama
git switch nueva-funcionalidad # Cambia a la nueva rama
```

### Moverse entre versiones

Es posible navegar entre commits y ramas.

**Ejemplo**:

```bash
git switch main # Cambia de rama
git switch -d 1234567 # Cambia a un commit específico usando su hash (primeros 7 caracteres) o --detach
```

### Revertir cambios

Si es necesario deshacer cambios, se pueden utilizar las siguientes opciones:

```bash
git revert <commit> #Deshace un commit específico generando un nuevo commit inverso.
```

```bash
git reset #Vuelve a un estado anterior.
```

**Ejemplo**:

```bash
git revert 1234567 # Revierte el commit 1234567

git reset --soft HEAD~1   # deshace el commit, mantiene cambios en stage
git reset --hard HEAD~1   # deshace todo, descarta los cambios
```

### Guardar un cambio sin commit

`git stash` guarda temporalmente los cambios no `commiteados` del working directory, dejando el proyecto limpio (como si no hubieras tocado nada). `git stash pop` los recupera después.

```bash
git stash
git stash pop
```

**Ejemplo**:

```bash
# Guardás tu trabajo en progreso
git stash

# Cambiás de rama, arreglás el bug, commiteás
git switch main
git commit -m "fix: corrige bug urgente"

# Volvés a tu rama y recuperás tu trabajo
git switch mi-feature
git stash pop

# Podés ponerle un nombre para identificarlo
git stash push -m "feature login en progreso"
```

### Acceder al historial de commits

Uno de los comandos más usados. Te permite acceder a toda la información de los commits: rama, fecha y hora, usuario que efectuó el cambio, etc

```bash
git log --oneline --graph --all
```

### Merges (Fusión de ramas)

Para combinar cambios de diferentes ramas:

**Ejemplo**:

```bash
git switch main # Nos movemos a la rama donde irán los cambios
git merge nueva-funcionalidad # Fusiona los cambios de 'nueva-funcionalidad' en 'main'
```

---

## 🛠️ Trabajar con GitHub

Para sincronizar un repositorio local con un repositorio remoto de GitHub, primero debes enlazar el repositorio con `git remote add origin` y luego hacer un push inicial.

### **📌 Enlazar un repositorio local con GitHub**

Si ya tienes un repositorio local y quieres conectarlo con un repositorio remoto en GitHub, usa el siguiente comando:

```bash
git remote add origin https://github.com/usuario/repositorio.git
git push -u origin main
```

📌 **Explicación:**

- `git remote add origin URL_DEL_REPO`: Conecta el repositorio local con el remoto.
- `git push -u origin main`: Sube la rama `main` al remoto y establece el upstream para que en el futuro puedas hacer `git push` sin especificar la rama.
### 📌 Clonar un repositorio de GitHub

Si necesitas obtener un repositorio en tu máquina local desde GitHub, usa:

```bash
git clone <url o uri>
```

📌 **Explicación:**

- Esto descargará el repositorio y lo guardará en una carpeta con el mismo nombre del proyecto.

Si deseas clonarlo en una carpeta específica, usa:

```bash
git clone <url o uri> mi-carpeta
```

---
### 📌 Subir cambios (Push)

Si realizaste cambios en tu repositorio local y quieres subirlos a GitHub:

```bash
git add .
git commit -m "Descripción del cambio"
git push origin main
```

📌 **Explicación:**

- `git add .` → Agrega todos los archivos modificados al área de preparación.
- `git commit -m "Descripción"` → Guarda los cambios en el historial de Git.
- `git push origin main` → Sube los cambios a la rama `main` del repositorio remoto.

Si la rama aún no está en GitHub, usa:

```bash
git push -u origin nombre-de-la-rama
```

### 📌 Descargar cambios (Pull)

Si quieres actualizar tu repositorio local con los últimos cambios de GitHub:

```bash
git pull origin main
```

📌 **Explicación:**

- Descarga los cambios de la rama `main` desde el remoto (`origin`) y los fusiona con tu código local.
- Si hay conflictos, Git te pedirá que los resuelvas manualmente.
### 📌 Traer ramas de un repositorio remoto

Si necesitas trabajar en una rama que existe en GitHub pero aún no está en tu local, usa:

```bash
git fetch origin
git switch nombre-de-la-rama
```

📌 **Explicación:**

- `git fetch origin` → Descarga información de las ramas sin fusionarlas.
- `git switch nombre-de-la-rama` → Cambia a la rama deseada.
- Si la rama aún no existe localmente, usa:

```bash
git switch -c nombre-de-la-rama origin/nombre-de-la-rama
```

Esto crea y cambia a la rama remota en tu entorno local.

---
## ⭐Tips 💫

1. **Commits frecuentes y descriptivos**: Un commit debe representar un cambio lógico y tener un mensaje claro.
    
2. **Uso de ramas para nuevas funcionalidades**: No trabajes directamente en main.
    
3. **Sincronizar con el repositorio remoto regularmente**: git pull antes de git push para evitar conflictos.
    
4. **Revisar cambios antes de confirmar**: Usa git status y git diff antes de un commit.
    
5. **Evitar git push --force**: Puede sobrescribir cambios en el remoto.
    
6. **Usar .gitignore para evitar archivos innecesarios**: Excluye archivos que no deben ser compartidos.

---

#git #github #wsl #shh #nivelacion 