import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TEMPLATES = {
  welcome: (name: string) => ({
    subject: `¡Bienvenido a CoachPro, ${name}!`,
    html: `<h1>Hola ${name}</h1><p>Tu cuenta está lista. Empieza tu primer curso hoy.</p>`,
  }),
  reminder: (name: string, course: string) => ({
    subject: `${name}, continúa tu progreso en CoachPro`,
    html: `<h1>Hola ${name}</h1><p>Te falta poco para completar <b>${course}</b>. ¡Tú puedes!</p>`,
  }),
  certificate: (name: string, course: string) => ({
    subject: `¡Felicitaciones! Tu certificado de ${course} está listo`,
    html: `<h1>¡Bien hecho, ${name}!</h1><p>Completaste <b>${course}</b>. Tu certificado está disponible en tu perfil.</p>`,
  }),
  achievement: (name: string, achievement: string) => ({
    subject: `¡Nuevo logro desbloqueado: ${achievement}!`,
    html: `<h1>¡Increíble, ${name}!</h1><p>Acabas de desbloquear el logro <b>${achievement}</b>. Sigue así.</p>`,
  }),
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { template, to, name, data } = await req.json()
    const resendKey = Deno.env.get('RESEND_API_KEY')

    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'Servicio de email no configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const templateFn = TEMPLATES[template as keyof typeof TEMPLATES]
    if (!templateFn) {
      return new Response(
        JSON.stringify({ error: 'Template no encontrado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { subject, html } = (templateFn as Function)(name, data?.course || data?.achievement)

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CoachPro <no-reply@coachpro.app>',
        to,
        subject,
        html,
      }),
    })

    const result = await emailRes.json()

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
