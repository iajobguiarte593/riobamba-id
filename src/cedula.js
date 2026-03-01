export function mostrarCedula(ciudadano) {
  document.getElementById('cedula-numero-display').textContent = `#${ciudadano.numero_ciudadano}`
  document.getElementById('cedula-nombre').textContent = ciudadano.nombre
  document.getElementById('cedula-parroquia').textContent = ciudadano.parroquia
  document.getElementById('form-section').style.display = 'none'
  document.getElementById('cedula-section').style.display = 'block'
}