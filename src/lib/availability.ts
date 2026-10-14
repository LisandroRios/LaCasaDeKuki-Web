// Motor de Disponibilidad y Cotización en Vivo — La Casa de Kuki (V2)

export interface CalendarEvent {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD (checkout day, non-inclusive)
  summary: string;
}

export interface DeptoOption {
  id: 'inti' | 'killa';
  name: string;
  tagline: string;
  capacityText: string;
  amenities: string[];
  image: string;
  pricePerNight: number;
  total: number;
  deposit: number;
  ctaText: string;
  whatsappMessage: string;
}

export interface SpecialInfo {
  badge: string;
  title: string;
  description: string;
  ctaText: string;
  whatsappMessage: string;
}

export interface AvailabilityResult {
  success: boolean;
  scenario: 'A' | 'B' | 'C' | 'D';
  checkIn: string;
  checkOut: string;
  checkInFormatted: string;
  checkOutFormatted: string;
  nightsCount: number;
  nightsText: string;
  huespedes: number;
  huespedesText: string;
  nombre: string;
  hasHotDate: boolean;
  isIntiAvailable: boolean;
  isKillaAvailable: boolean;
  options?: DeptoOption[];
  specialInfo?: SpecialInfo;
}

/**
 * Parsea el texto iCal (.ics) de forma liviana sin dependencias externas
 */
export function parseIcs(icsText: string): CalendarEvent[] {
  // Desplegar líneas plegadas de RFC 5545 (\r\n espacio o tab)
  const unfolded = icsText.replace(/\r?\n[ \t]/g, '');
  const veventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  const events: CalendarEvent[] = [];
  let match: RegExpExecArray | null;

  while ((match = veventRegex.exec(unfolded)) !== null) {
    const block = match[1];

    // Ignorar eventos cancelados
    if (/STATUS:\s*CANCELLED/i.test(block)) {
      continue;
    }

    // Extraer DTSTART (soportando VALUE=DATE:YYYYMMDD o datetime YYYYMMDDTHHMMSS)
    const dtstartMatch = block.match(/DTSTART[^:\r\n]*:([0-9]{8})/);
    if (!dtstartMatch) continue;

    const s = dtstartMatch[1];
    const startDate = `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;

    // Extraer DTEND
    const dtendMatch = block.match(/DTEND[^:\r\n]*:([0-9]{8})/);
    let endDate: string;

    if (dtendMatch) {
      const e = dtendMatch[1];
      endDate = `${e.slice(0, 4)}-${e.slice(4, 6)}-${e.slice(6, 8)}`;
    } else {
      // Si no tiene DTEND dura 1 día
      const d = new Date(`${startDate}T00:00:00Z`);
      d.setUTCDate(d.getUTCDate() + 1);
      endDate = d.toISOString().split('T')[0];
    }

    const summaryMatch = block.match(/SUMMARY[^:\r\n]*:([^\r\n]+)/);
    const summary = summaryMatch ? summaryMatch[1].trim() : '';

    events.push({ startDate, endDate, summary });
  }

  return events;
}

/**
 * Determina si una noche específica (YYYY-MM-DD) cae dentro de algún evento (DTSTART <= D < DTEND)
 */
export function isNightOccupied(night: string, events: CalendarEvent[]): boolean {
  return events.some(ev => ev.startDate <= night && night < ev.endDate);
}

/**
 * Genera la lista de noches a evaluar entre checkIn y checkOut (excluyendo checkOut)
 */
export function getStayNights(checkIn: string, checkOut: string): string[] {
  const start = new Date(`${checkIn}T00:00:00Z`);
  const end = new Date(`${checkOut}T00:00:00Z`);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (isNaN(diffDays) || diffDays <= 0) {
    return [];
  }

  const nights: string[] = [];
  for (let i = 0; i < diffDays; i++) {
    const cur = new Date(start.getTime() + i * 86400000);
    nights.push(cur.toISOString().split('T')[0]);
  }
  return nights;
}

/**
 * Formatea una fecha YYYY-MM-DD a DD/MM/YYYY
 */
export function formatDate(isoStr: string): string {
  const parts = isoStr.split('-');
  if (parts.length !== 3) return isoStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Formatea un monto a moneda argentina ($XX.XXX)
 */
export function formatCurrency(amount: number): string {
  return '$' + Math.round(amount).toLocaleString('es-AR');
}

/**
 * Descarga y parsea un calendario iCal con control de timeout y sin caché
 */
async function fetchIcal(url: string | undefined): Promise<CalendarEvent[]> {
  if (!url || !url.trim()) return [];
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'LaCasaDeKuki-AvailabilityEngine/2.0',
        'Accept': 'text/calendar, text/plain, */*'
      }
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.error(`Error al obtener calendario (${res.status}): ${url}`);
      return [];
    }
    const text = await res.text();
    return parseIcs(text);
  } catch (err) {
    console.error('Fallo en fetchIcal:', err);
    return [];
  }
}

/**
 * Evalúa la disponibilidad completa y calcula tarifas según las reglas de negocio de V2
 */
export async function checkAvailability(params: {
  nombre?: string;
  huespedes: number;
  checkIn: string;
  checkOut: string;
  icalUrls?: {
    fechasCalientes?: string;
    inti?: string;
    killa?: string;
  };
}): Promise<AvailabilityResult> {
  const nombre = (params.nombre || '').trim() || 'Huésped';
  const huespedes = Math.max(1, Math.min(10, Math.floor(params.huespedes)));
  const { checkIn, checkOut } = params;

  const nights = getStayNights(checkIn, checkOut);
  if (nights.length === 0) {
    throw new Error('Las fechas son inválidas. El check-out debe ser posterior al check-in.');
  }

  const checkInFormatted = formatDate(checkIn);
  const checkOutFormatted = formatDate(checkOut);
  const nightsCount = nights.length;
  const nightsText = nightsCount === 1 ? '1 noche' : `${nightsCount} noches`;
  const huespedesText = huespedes === 1 ? '1 persona' : `${huespedes} personas`;

  // Obtener URLs de los 3 calendarios desde params o variables de entorno
  const urlCalientes = params.icalUrls?.fechasCalientes
    || (typeof import.meta !== 'undefined' && (import.meta as any).env?.ICAL_FECHAS_CALIENTES)
    || process.env.ICAL_FECHAS_CALIENTES;
  const urlInti = params.icalUrls?.inti
    || (typeof import.meta !== 'undefined' && (import.meta as any).env?.ICAL_INTI)
    || process.env.ICAL_INTI;
  const urlKilla = params.icalUrls?.killa
    || (typeof import.meta !== 'undefined' && (import.meta as any).env?.ICAL_KILLA)
    || process.env.ICAL_KILLA;

  // Descarga concurrente de los 3 iCals
  const [eventsCalientes, eventsInti, eventsKilla] = await Promise.all([
    fetchIcal(urlCalientes),
    fetchIcal(urlInti),
    fetchIcal(urlKilla)
  ]);

  // Cruce de disponibilidad para cada noche
  const hasHotDate = nights.some(night => isNightOccupied(night, eventsCalientes));
  const isIntiAvailable = nights.every(night => !isNightOccupied(night, eventsInti));
  const isKillaAvailable = nights.every(night => !isNightOccupied(night, eventsKilla));

  // Capacidad física por cantidad de personas:
  // - 1 a 4 personas: apto Killa (1-4) o Inti (1-6)
  // - 5 a 6 personas: únicamente Inti (1-6)
  // - 7 a 10 personas: requiere Complejo Completo (Inti + Killa libres en simultáneo)
  let hasPhysicalCapacity = false;
  if (huespedes <= 4) {
    hasPhysicalCapacity = isKillaAvailable || isIntiAvailable;
  } else if (huespedes <= 6) {
    hasPhysicalCapacity = isIntiAvailable;
  } else {
    hasPhysicalCapacity = isIntiAvailable && isKillaAvailable;
  }

  // Determinación de escenario según V2:
  // Si no hay capacidad física -> Escenario D
  // Si hay capacidad física y al menos 1 noche es fecha caliente -> Escenario B
  // Si hay capacidad física, no es fecha caliente y son 7-10 personas -> Escenario C
  // Si hay capacidad física, no es fecha caliente y son 1-6 personas -> Escenario A

  if (!hasPhysicalCapacity) {
    // ESCENARIO D: Sin disponibilidad directa / Derivación
    const waMessage = `¡Hola! Soy ${nombre}. Vi en la web que tienen agenda ajustada del *${checkInFormatted}* al *${checkOutFormatted}* para *${huespedesText}*. ¿Tienen alguna alternativa o disponibilidad cercana?`;

    return {
      success: true,
      scenario: 'D',
      checkIn,
      checkOut,
      checkInFormatted,
      checkOutFormatted,
      nightsCount,
      nightsText,
      huespedes,
      huespedesText,
      nombre,
      hasHotDate,
      isIntiAvailable,
      isKillaAvailable,
      specialInfo: {
        badge: 'Fechas con alta demanda',
        title: 'Fechas con alta demanda',
        description: 'En este momento no nos queda disponibilidad directa en el sistema para esa combinación, pero escribinos por WhatsApp para revisar si podemos reacomodar fechas o ubicarte en nuestro hospedaje familiar aliado en Purmamarca.',
        ctaText: 'Consultar alternativa por WhatsApp',
        whatsappMessage: waMessage
      }
    };
  }

  if (hasHotDate) {
    // ESCENARIO B: Fechas Calientes / Temporada Especial (1 a 10 huéspedes con capacidad física)
    const waMessage = `¡Hola! Soy ${nombre}. Vi en la web que tienen disponibilidad del *${checkInFormatted}* al *${checkOutFormatted}* (${nightsText}) para *${huespedesText}* (Fecha Especial). ¿Me podrían pasar la cotización para reservar?`;

    return {
      success: true,
      scenario: 'B',
      checkIn,
      checkOut,
      checkInFormatted,
      checkOutFormatted,
      nightsCount,
      nightsText,
      huespedes,
      huespedesText,
      nombre,
      hasHotDate: true,
      isIntiAvailable,
      isKillaAvailable,
      specialInfo: {
        badge: 'Temporada Especial / Feriado',
        title: '¡Tenemos disponibilidad para tus fechas!',
        description: 'Las fechas seleccionadas corresponden a temporada especial o feriado. Consultanos directo por WhatsApp para pasarte la cotización exacta.',
        ctaText: 'Pedir cotización por WhatsApp',
        whatsappMessage: waMessage
      }
    };
  }

  if (huespedes >= 7) {
    // ESCENARIO C: Grupo Grande / Complejo Completo (7 a 10 personas, Inti y Killa 100% libres)
    const waMessage = `¡Hola! Soy ${nombre}. Somos un grupo de *${huespedesText}* buscando alojamiento del *${checkInFormatted}* al *${checkOutFormatted}* (${nightsText}). Vi en la web que tienen ambos departamentos libres, ¿me pasás info y tarifa?`;

    return {
      success: true,
      scenario: 'C',
      checkIn,
      checkOut,
      checkInFormatted,
      checkOutFormatted,
      nightsCount,
      nightsText,
      huespedes,
      huespedesText,
      nombre,
      hasHotDate: false,
      isIntiAvailable: true,
      isKillaAvailable: true,
      specialInfo: {
        badge: 'Complejo Completo (Inti + Killa)',
        title: '¡Complejo Completo disponible! (Inti + Killa)',
        description: 'Contamos con ambos departamentos libres en simultáneo para recibir a tu grupo. Escribinos directo para coordinar los detalles y pasarte una tarifa para el grupo.',
        ctaText: 'Consultar tarifa grupal por WhatsApp',
        whatsappMessage: waMessage
      }
    };
  }

  // ESCENARIO A: Días Normales con Disponibilidad (1 a 6 huéspedes)
  const options: DeptoOption[] = [];

  // Evaluar Killa (1 a 4 personas)
  if (huespedes <= 4 && isKillaAvailable) {
    const pricePerNight = huespedes <= 2 ? 50000 : 60000;
    const total = pricePerNight * nightsCount;
    const deposit = Math.round(total * 0.20);
    const waMessage = `¡Hola! Soy ${nombre}. Vi en la web que el *Departamento Killa* está disponible del *${checkInFormatted}* al *${checkOutFormatted}* (${nightsText}) para *${huespedesText}* (Total: ${formatCurrency(total)}). Quiero reservarlo, ¿me pasás el alias para transferir la seña de ${formatCurrency(deposit)}?`;

    options.push({
      id: 'killa',
      name: 'Departamento Killa',
      tagline: 'Cálido y funcional · Ideal familias pequeñas o parejas',
      capacityText: 'Capacidad de 1 a 4 personas',
      amenities: [
        '1 cama matrimonial + 1 cama cucheta',
        'Baño privado con agua caliente y toallas',
        'Pava eléctrica y kit de infusiones',
        'Wi-Fi y estacionamiento privado dentro del predio',
        'Acceso libre al quincho con cocina y parrilla'
      ],
      image: '/images/killa/killa-09.webp',
      pricePerNight,
      total,
      deposit,
      ctaText: 'Quiero reservar Departamento Killa',
      whatsappMessage: waMessage
    });
  }

  // Evaluar Inti (1 a 6 personas)
  if (huespedes <= 6 && isIntiAvailable) {
    const pricePerNight = huespedes <= 3 ? 65000 : 75000;
    const total = pricePerNight * nightsCount;
    const deposit = Math.round(total * 0.20);
    const waMessage = `¡Hola! Soy ${nombre}. Vi en la web que el *Departamento Inti* está disponible del *${checkInFormatted}* al *${checkOutFormatted}* (${nightsText}) para *${huespedesText}* (Total: ${formatCurrency(total)}). Quiero reservarlo, ¿me pasás el alias para transferir la seña de ${formatCurrency(deposit)}?`;

    options.push({
      id: 'inti',
      name: 'Departamento Inti',
      tagline: 'Espacioso y equipado · Ideal familias o grupos',
      capacityText: 'Capacidad de 1 a 6 personas',
      amenities: [
        '1 cama matrimonial + 2 camas cuchetas (4 camas)',
        'Comedor con mesa, sillas, heladera y microondas',
        'TV con Chromecast y Wi-Fi de alta velocidad',
        'Baño privado con agua caliente y toallas',
        'Estacionamiento privado y quincho con parrilla'
      ],
      image: '/images/inti/inti-10.webp',
      pricePerNight,
      total,
      deposit,
      ctaText: 'Quiero reservar Departamento Inti',
      whatsappMessage: waMessage
    });
  }

  return {
    success: true,
    scenario: 'A',
    checkIn,
    checkOut,
    checkInFormatted,
    checkOutFormatted,
    nightsCount,
    nightsText,
    huespedes,
    huespedesText,
    nombre,
    hasHotDate: false,
    isIntiAvailable,
    isKillaAvailable,
    options
  };
}
