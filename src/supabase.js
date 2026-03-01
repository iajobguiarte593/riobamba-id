const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

export async function registrarCiudadano(datos) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/ciudadanos`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Accept-Profile': 'riobamba_id',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify({
      whatsapp_hash: datos.whatsapp_hash,
      nombre: datos.nombre,
      parroquia: datos.parroquia,
      fecha_nacimiento: datos.fecha_nacimiento,
      canal_entrada: 'pwa_directa'
    })
  })

  if (!res.ok) throw new Error(await res.text())
  const data = await res.json()
  return data[0]
}