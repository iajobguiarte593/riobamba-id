import './style.css'
import { registrarCiudadano, buscarCiudadano } from './supabase.js'
import { mostrarCedula } from './cedula.js'

document.querySelector('#app').innerHTML = `
  <div class="container">
    <div class="header">
      <div class="escudo">🏔️</div>
      <h1 class="titulo">RIOBAMBA<span>ID</span></h1>
      <p class="subtitulo">Identidad Digital Ciudadana</p>
    </div>

    <div id="form-section">
      <div class="divider"><span class="divider-text">Registro Ciudadano</span></div>
      <form class="form" id="form-registro">
        <div class="field">
          <label>Nombre completo</label>
          <input type="text" id="nombre" placeholder="Tu nombre y apellido" required />
        </div>
        <div class="field">
          <label>Parroquia</label>
          <select id="parroquia" required>
            <option value="" disabled selected>Selecciona tu parroquia</option>
            <option value="Lizarzaburu">Lizarzaburu</option>
            <option value="Veloz">Veloz</option>
            <option value="Maldonado">Maldonado</option>
            <option value="Velasco">Velasco</option>
            <option value="Yaruquíes">Yaruquíes</option>
            <option value="Otra">Otra</option>
          </select>
        </div>
        <div class="field">
          <label>Fecha de nacimiento</label>
          <input type="date" id="fecha_nacimiento" required />
        </div>
        <div class="error-msg" id="error-msg">⚠ Ocurrió un error. Intenta nuevamente.</div>
        <button type="submit" class="btn" id="btn-registro">
          <span class="btn-text">Obtener mi Cédula Digital</span>
          <span class="btn-spinner" style="display:none">Registrando...</span>
        </button>
      </form>
    </div>

    <div class="cedula-wrapper" id="cedula-section" style="display:none">
      <div class="divider"><span class="divider-text">Tu Cédula Digital</span></div>
      <div class="cedula">
        <div class="cedula-header">
          <div class="cedula-escudo">🏔️</div>
          <div>
            <div class="cedula-titulo">RIOBAMBA ID</div>
            <div class="cedula-pais">Ecuador · Chimborazo</div>
          </div>
        </div>
        <div class="cedula-numero">
          Ciudadano Riobambeño
          <span id="cedula-numero-display">#0000</span>
        </div>
        <div class="cedula-datos">
          <div class="cedula-campo">
            <label>Nombre</label>
            <p id="cedula-nombre">—</p>
          </div>
          <div class="cedula-campo">
            <label>Parroquia</label>
            <p id="cedula-parroquia">—</p>
          </div>
        </div>
        <div class="cedula-nivel">
          <span class="nivel-badge">⭐</span>
          <div class="nivel-info">
            <small>Nivel actual</small>
            <strong>Chulla</strong>
          </div>
        </div>
      </div>
      <button class="btn-compartir" id="btn-compartir">📤 Compartir mi Cédula</button>
    </div>

    <div class="footer">Kamanu IA · Riobamba, Ecuador</div>
  </div>
`

// REGISTRO
document.getElementById('form-registro').addEventListener('submit', async (e) => {
  e.preventDefault()
  const btn = document.getElementById('btn-registro')
  const errorMsg = document.getElementById('error-msg')
  
  btn.querySelector('.btn-text').style.display = 'none'
  btn.querySelector('.btn-spinner').style.display = 'inline'
  errorMsg.style.display = 'none'

  const nombre = document.getElementById('nombre').value.trim()
  const parroquia = document.getElementById('parroquia').value
  const fecha_nacimiento = document.getElementById('fecha_nacimiento').value

  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(navigator.userAgent + Date.now()))
  const whatsapp_hash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2,'0')).join('')

  try {
    const ciudadano = await registrarCiudadano({ nombre, parroquia, fecha_nacimiento, whatsapp_hash })
    
    document.getElementById('cedula-numero-display').textContent = `#${ciudadano.numero_ciudadano}`
    document.getElementById('cedula-nombre').textContent = ciudadano.nombre
    document.getElementById('cedula-parroquia').textContent = ciudadano.parroquia

    document.getElementById('form-section').style.display = 'none'
    document.getElementById('cedula-section').style.display = 'block'

  } catch (err) {
    console.error(err)
    errorMsg.style.display = 'block'
    btn.querySelector('.btn-text').style.display = 'inline'
    btn.querySelector('.btn-spinner').style.display = 'none'
  }
})

// COMPARTIR
document.getElementById('btn-compartir')?.addEventListener('click', () => {
  const numero = document.getElementById('cedula-numero-display').textContent
  const nombre = document.getElementById('cedula-nombre').textContent
  const texto = `¡Soy ${nombre}, ${numero} de Riobamba ID! 🏔️ ¿Cuál es tu número?`
  if (navigator.share) {
    navigator.share({ title: 'Riobamba ID', text: texto })
  } else {
    navigator.clipboard.writeText(texto)
    alert('¡Copiado! Compártelo donde quieras.')
  }
})