export const prerender = false;

import type { APIRoute } from 'astro';
import { checkAvailability } from '../../lib/availability';

function validateParams(rawNombre: unknown, rawHuespedes: unknown, rawCheckIn: unknown, rawCheckOut: unknown) {
  const nombre = typeof rawNombre === 'string' ? rawNombre.trim().slice(0, 80) : '';
  const huespedes = parseInt(String(rawHuespedes), 10);
  const checkIn = String(rawCheckIn || '').trim();
  const checkOut = String(rawCheckOut || '').trim();

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!checkIn || !dateRegex.test(checkIn)) {
    return { error: 'Fecha de ingreso inválida (se espera formato YYYY-MM-DD).' };
  }
  if (!checkOut || !dateRegex.test(checkOut)) {
    return { error: 'Fecha de egreso inválida (se espera formato YYYY-MM-DD).' };
  }
  if (checkOut <= checkIn) {
    return { error: 'La fecha de egreso debe ser posterior a la fecha de ingreso.' };
  }
  if (isNaN(huespedes) || huespedes < 1 || huespedes > 10) {
    return { error: 'La cantidad de huéspedes debe estar entre 1 y 10.' };
  }

  return { nombre, huespedes, checkIn, checkOut };
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const rawNombre = url.searchParams.get('nombre') || url.searchParams.get('name') || '';
    const rawHuespedes = url.searchParams.get('huespedes') || url.searchParams.get('guests');
    const rawCheckIn = url.searchParams.get('ingreso') || url.searchParams.get('checkIn');
    const rawCheckOut = url.searchParams.get('egreso') || url.searchParams.get('checkOut');

    const validation = validateParams(rawNombre, rawHuespedes, rawCheckIn, rawCheckOut);
    if ('error' in validation) {
      return new Response(JSON.stringify({ success: false, error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }

    const result = await checkAvailability(validation);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err: any) {
    console.error('Error en /api/disponibilidad (GET):', err);
    return new Response(JSON.stringify({
      success: false,
      error: err?.message || 'Error interno al consultar disponibilidad.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ success: false, error: 'Cuerpo de solicitud inválido (se espera JSON).' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }

    const rawNombre = body.nombre ?? body.name ?? '';
    const rawHuespedes = body.huespedes ?? body.guests;
    const rawCheckIn = body.ingreso ?? body.checkIn;
    const rawCheckOut = body.egreso ?? body.checkOut;

    const validation = validateParams(rawNombre, rawHuespedes, rawCheckIn, rawCheckOut);
    if ('error' in validation) {
      return new Response(JSON.stringify({ success: false, error: validation.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
      });
    }

    const result = await checkAvailability(validation);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (err: any) {
    console.error('Error en /api/disponibilidad (POST):', err);
    return new Response(JSON.stringify({
      success: false,
      error: err?.message || 'Error interno al consultar disponibilidad.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  }
};
