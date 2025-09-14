// import the funcion to register users from the userService module
import { registerUser } from '../services/userService.js';

// Get the main app container where views will be rendered
const app = document.getElementById('app');

/** 
 * Configurar rutas de vistas
 * Recibe el nombre de la vista (home, board, etc)
 * Construye la URL del archivo HTML correspondiente. Ejemplo: viewURL('home') → ../views/home.html
 * Usa import.meta.url (funciona tanto en desarrollo como en build).
*/
const viewURL = (name) => new URL(`../views/${name}.html`, import.meta.url);

/**
 * Initialize the hash-based router.
 * Escucha los cambios de location.hash (location.hash = Detecta la ruta actual)
 * Cuando se carga por primera vez, llama a handleRoute() para mostrar la vista inicial.
 */
export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute(); // first render
}

// Maneja (handle) la ruta actual en función del hash de ubicación.
function handleRoute() {
    // Toma el location.hash, le quita #/. Si está vacío, usa 'home'. Ejemplo: #/board → "board"
    const path = (location.hash.startsWith('#/') ? location.hash.slice(2) : '') || 'home';
    const known = ['home', 'board'];
    
    // Si la ruta no está en known (conocidas), redirige a "home"
    const route = known.includes(path) ? path : 'home';

    // Llama a loadView(route) para cargar la vista correspondiente
    loadView(route).catch(err => {
        console.error(err);
        app.innerHTML = `<p style="color:#ffb4b4">Error loading the view.</p>`;
    });
}

// Carga un fragmento HTML por nombre de vista e inicializa su lógica correspondiente.
async function loadView(name) {
    // Trae el archivo HTML de la vista correspondiente (desde por ejemplo ../views/home.html)
    const res = await fetch(viewURL(name));
    if (!res.ok) throw new Error(`Failed to load view: ${name}`);

    // Aquí se convierte la respuesta (res) en texto HTML
    const html = await res.text();

    // Se toma el html que se trajo y lo mete dentro del elemento app (lo inyecta dentro del <div id="app"></div>)
    app.innerHTML = html;

    // Después de cargar la vista, se verifica qué vista es (Según la vista, ejecuta la lógica que le corresponde)
    if (name === 'home') initHome();
    if (name === 'board') initBoard();
}

/* ---- View-specific logic ---- */

// Initialize the "home" view.
function initHome() {
    // Toma el form llamado registerForm
    const form = document.getElementById('registerForm');

    // Toma los inputs y el párrafo de mensajes de alerta
    const nameInput = document.getElementById('username');
    const lastInput = document.getElementById('lastName');
    const ageInput = document.getElementById('age');
    const emailInput = document.getElementById('email');
    const passInput = document.getElementById('password');
    const confirmPassInput = document.getElementById('confirmPassword');
    const msg = document.getElementById('registerMsg');

    // Si no existe el form, sale de la función
    if (!form) return;

    // Se escucha el evento submit del formulario
    // Por defecto, un formulario recarga la página cuando lo envías, pero aquí usamos preventDefault() para evitar eso y manejarlo con JavaScript.
    form.addEventListener('submit', async (e) => {

        // bloquea la recarga automática.
        e.preventDefault();

        // borra cualquier mensaje anterior (para empezar limpio)
        msg.textContent = '';

        // Se obtiene lo que el usuario escribió en los campos de usuario y contraseña
        // ?. es un “seguro”: si userInput o passInput no existen, no rompe el código.
        // .trim() elimina espacios en blanco al inicio y final.
        const firstName = nameInput?.value.trim();
        const lastName = lastInput?.value.trim();
        const age = ageInput?.value.trim();
        const email = emailInput?.value.trim();
        const password = passInput?.value.trim();
        const confirmPassword = confirmPassInput?.value.trim();
    
        // Validación simple: si falta usuario o contraseña, muestra un mensaje y sale.
        if (!firstName || !password) {
            msg.textContent = 'Por favor completa usuario y contraseña.';
            return;
        }

        // Deshabilita el botón de submit para evitar múltiples envíos mientras se procesa
        form.querySelector('button[type="submit"]').disabled = true;

        try {
            // Llama a registerUser (de userService.js) para registrar al usuario (manda los datos a la API (backend))
            const data = await registerUser({ firstName, lastName, age, email, password, confirmPassword });

            // Si todo va bien, muestra mensaje de éxito
            msg.textContent = 'Registro exitoso';

            // Después de un breve retraso, redirige a la vista "board" (location.hash = Cambia la ruta actual)
            setTimeout(() => (location.hash = '#/board'), 400);
        } catch (err) {
            // Si hubo un error (por ejemplo, la API falló), se muestra un mensaje con la razón
            msg.textContent = `No se pudo registrar: ${err.message}`;
        } finally {
            // Siempre vuelve a habilitar el botón de submit al final (El bloque finally siempre se ejecuta, pase lo que pase (éxito o error)
            form.querySelector('button[type="submit"]').disabled = false;
        }
    });
}

// Initialize the "board" view.
function initBoard() {
    // Toma el form llamado todoForm
    const form = document.getElementById('todoForm');

    // Toma el input y la lista de tareas (la lista (ul o ol) donde se van a mostrar las tareas)
    const input = document.getElementById('newTodo');
    const list = document.getElementById('todoList');

    // Si alguno de esos elementos no existe en el HTML, la función se detiene para evitar errores
    if (!form || !input || !list) return;

    // Se escucha cuando se envía el formulario (cuando el usuario agrega una tarea)
    form.addEventListener('submit', (e) => {
        // Evita que el formulario recargue la página (comportamiento normal de los forms)
        e.preventDefault();

        // Obtiene el texto escrito en la caja de input. Si está vacío (sin texto), no hace nada
        const title = input.value.trim();
        if (!title) return;

        // Crea un nuevo elemento <li> (una tarea en la lista)
        const li = document.createElement('li');

        // Le asigna la clase todo para estilos o identificación
        li.className = 'todo';

        // Define el contenido de la tarea (HTML interno)
        li.innerHTML = `
      <label>
        <input type="checkbox" class="check">
        <span>${title}</span>
      </label>
      <button class="link remove" type="button">Eliminar</button>
    `;
        // Inserta la nueva tarea al inicio de la lista (prepend). 
        list.prepend(li);
        //Limpia la caja de texto para que quede vacía y lista para otra tarea
        input.value = '';
    });

    // Escucha cualquier clic que ocurra dentro de la lista de tareas
    list.addEventListener('click', (e) => {
        // Busca el <li> (tarea) más cercano al elemento donde se hizo clic. Si no encuentra ninguno, no hace nada.
        const li = e.target.closest('.todo');
        if (!li) return;

        // Si el clic fue en un botón con la clase .remove, elimina la tarea.
        if (e.target.matches('.remove')) li.remove();

        // Si el clic fue en el checkbox .check: Activa o desactiva la clase completed en el <li>
        if (e.target.matches('.check')) li.classList.toggle('completed', e.target.checked);
    });
}