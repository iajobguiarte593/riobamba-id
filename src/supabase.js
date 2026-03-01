const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
}

export async function registrarCiudadano(datos) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ciudadanos`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify({
      whatsapp_hash: datos.whatsapp_hash,
      nombre: datos.nombre,
      parroquia: datos.parroquia,
      fecha_nacimiento: datos.fecha_nacimiento,
      canal_entrada: datos.canal_entrada || 'pwa_directa',
      nivel: 'Chulla',
      checkins_total: 0,
      activo: true
    })
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json())[0]
}

export async function buscarCiudadano(whatsapp_hash) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ciudadanos?whatsapp_hash=eq.${whatsapp_hash}&limit=1`, { headers })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json())[0] || null
}

export async function obtenerNegocios(filtros = {}) {
  let url = `${SUPABASE_URL}/rest/v1/negocios?activo=eq.true&order=nombre.asc`
  if (filtros.categoria) url += `&categoria=eq.${encodeURIComponent(filtros.categoria)}`
  const res = await fetch(url, { headers: { ...headers, 'Accept-Profile': 'riobamba_id' } })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function obtenerNegocioPorQR(qr_code_id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/negocios?qr_code_id=eq.${qr_code_id}&activo=eq.true&limit=1`, {
    headers: { ...headers, 'Accept-Profile': 'riobamba_id' }
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json())[0] || null
}

export async function registrarCheckin(ciudadano_id, negocio_id, nivel_ciudadano) {
  const ahora = new Date()
  const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const res = await fetch(`${SUPABASE_URL}/rest/v1/checkins`, {
    method: 'POST',
    headers: { ...headers, 'Accept-Profile': 'riobamba_id', 'Prefer': 'return=representation' },
    body: JSON.stringify({
      ciudadano_id, negocio_id,
      fecha: ahora.toISOString(),
      dia_semana: dias[ahora.getDay()],
      hora_del_dia: ahora.getHours(),
      nivel_ciudadano_momento: nivel_ciudadano
    })
  })
  if (!res.ok) throw new Error(await res.text())
  await actualizarNivelCiudadano(ciudadano_id)
  return (await res.json())[0]
}

async function actualizarNivelCiudadano(ciudadano_id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/checkins?ciudadano_id=eq.${ciudadano_id}&select=id`, {
    headers: { ...headers, 'Accept-Profile': 'riobamba_id', 'Prefer': 'count=exact' }
  })
  const total = parseInt(res.headers.get('Content-Range')?.split('/')[1] || '0')
  let nivel = 'Chulla'
  if (total >= 20) nivel = 'Sultán de los Andes'
  else if (total >= 5) nivel = 'Puruhá'
  await fetch(`${SUPABASE_URL}/rest/v1/ciudadanos?id=eq.${ciudadano_id}`, {
    method: 'PATCH',
    headers: { ...headers, 'Prefer': 'return=minimal' },
    body: JSON.stringify({ checkins_total: total, nivel })
  })
}

export async function obtenerCheckinsCiudadano(ciudadano_id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/checkins?ciudadano_id=eq.${ciudadano_id}&order=fecha.desc`, {
    headers: { ...headers, 'Accept-Profile': 'riobamba_id' }
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function obtenerPreguntaActiva() {
  const ahora = new Date().toISOString()
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pulso_preguntas?activa=eq.true&fecha_inicio=lte.${ahora}&fecha_fin=gte.${ahora}&limit=1`, {
    headers: { ...headers, 'Accept-Profile': 'riobamba_id' }
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json())[0] || null
}

export async function responderPulso(ciudadano_id, pregunta_id, respuesta, parroquia) {
  const check = await fetch(`${SUPABASE_URL}/rest/v1/pulso_respuestas?ciudadano_id=eq.${ciudadano_id}&pregunta_id=eq.${pregunta_id}&limit=1`, {
    headers: { ...headers, 'Accept-Profile': 'riobamba_id' }
  })
  const existing = await check.json()
  if (existing.length > 0) return { yaRespondio: true }
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pulso_respuestas`, {
    method: 'POST',
    headers: { ...headers, 'Accept-Profile': 'riobamba_id', 'Prefer': 'return=representation' },
    body: JSON.stringify({ ciudadano_id, pregunta_id, respuesta, parroquia, fecha: new Date().toISOString() })
  })
  if (!res.ok) throw new Error(await res.text())
  return { yaRespondio: false, data: (await res.json())[0] }
}

export async function obtenerResultadosPulso(pregunta_id) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/pulso_respuestas?pregunta_id=eq.${pregunta_id}&select=respuesta`, {
    headers: { ...headers, 'Accept-Profile': 'riobamba_id' }
  })
  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  const conteo = {}
  data.forEach(r => { conteo[r.respuesta] = (conteo[r.respuesta] || 0) + 1 })
  return conteo
}
