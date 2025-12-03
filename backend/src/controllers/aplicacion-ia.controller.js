// backend/src/controllers/aplicacion-ia.controller.js

const https = require('https');

/**
 * Obtiene sugerencias de IA para una aplicación de insumos
 */
const obtenerSugerenciaIA = async (req, res) => {
  try {
    const { cultivo, tipoAplicacion, hectareas, etapaCultivo, parcelaInfo } = req.body;

    console.log('📤 Petición de sugerencia IA recibida:', req.body);

    // Validar datos requeridos
    if (!cultivo || !tipoAplicacion) {
      return res.status(400).json({
        error: 'Cultivo y tipo de aplicación son requeridos'
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    // Si no hay API Key, usar respuesta mock
    if (!apiKey || apiKey === 'tu-api-key-aqui') {
      console.log('⚠️ No hay API Key configurada, usando respuesta mock');
      return enviarSugerenciaMock(res, cultivo, tipoAplicacion, hectareas);
    }

    // Construir prompt contextual
    const prompt = `Eres un experto agrónomo especializado en manejo de cultivos. 

Necesito que me proporciones una recomendación técnica para una aplicación de insumos con los siguientes datos:

- Cultivo: ${cultivo}
- Tipo de aplicación: ${tipoAplicacion}
- Hectáreas a aplicar: ${hectareas || 'No especificado'}
- Etapa del cultivo: ${etapaCultivo || 'No especificado'}
${parcelaInfo ? `- Información adicional: ${parcelaInfo}` : ''}

Por favor, proporciona una recomendación estructurada en formato JSON con la siguiente estructura:

{
  "insumos": [
    {
      "nombre": "Nombre del insumo",
      "dosisHectarea": número,
      "unidad": "kg, L, etc",
      "razon": "Breve explicación de por qué este insumo"
    }
  ],
  "momentoOptimo": "Cuándo es el mejor momento para aplicar",
  "observaciones": [
    "Observación importante 1",
    "Observación importante 2"
  ],
  "precauciones": [
    "Precaución 1",
    "Precaución 2"
  ]
}

Responde ÚNICAMENTE con el JSON, sin texto adicional antes o después.`;

    // Construir payload para Anthropic API
    const payload = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Configurar opciones de la petición
    const options = {
      hostname: 'api.anthropic.com',
      port: 443,
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    // Hacer petición a Anthropic API
    const apiRequest = https.request(options, (apiResponse) => {
      let data = '';

      apiResponse.on('data', (chunk) => {
        data += chunk;
      });

      apiResponse.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (apiResponse.statusCode !== 200) {
            console.error('❌ Error de Anthropic API:', response);
            return enviarSugerenciaMock(res, cultivo, tipoAplicacion, hectareas);
          }

          // Extraer respuesta
          let responseText = response.content[0].text;

          // Limpiar respuesta (remover markdown si existe)
          responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

          // Parsear JSON
          const sugerencia = JSON.parse(responseText);

          // Retornar sugerencia
          res.json({
            success: true,
            sugerencia,
            generadoEn: new Date().toISOString(),
            powered: 'Claude AI'
          });

        } catch (parseError) {
          console.error('❌ Error al parsear respuesta:', parseError);
          enviarSugerenciaMock(res, cultivo, tipoAplicacion, hectareas);
        }
      });
    });

    apiRequest.on('error', (error) => {
      console.error('❌ Error en petición a Anthropic:', error);
      enviarSugerenciaMock(res, cultivo, tipoAplicacion, hectareas);
    });

    // Enviar payload
    apiRequest.write(payload);
    apiRequest.end();

  } catch (error) {
    console.error('❌ Error general al generar sugerencia:', error);
    enviarSugerenciaMock(res, cultivo, tipoAplicacion, hectareas);
  }
};

/**
 * Envía una sugerencia mock cuando no hay API o hay error
 */
function enviarSugerenciaMock(res, cultivo, tipoAplicacion, hectareas) {
  const sugerencia = generarSugerenciaMock(cultivo, tipoAplicacion, hectareas);
  
  res.json({
    success: true,
    sugerencia,
    generadoEn: new Date().toISOString(),
    mock: true
  });
}

/**
 * Genera sugerencias mock basadas en el tipo de aplicación
 */
function generarSugerenciaMock(cultivo, tipoAplicacion, hectareas) {
  const sugerenciasPorTipo = {
    'Fertilización': {
      insumos: [
        {
          nombre: 'Fertilizante NPK 15-15-15',
          dosisHectarea: 200,
          unidad: 'kg',
          razon: `Proporciona nutrientes balanceados para ${cultivo} en etapa vegetativa`
        },
        {
          nombre: 'Urea 46%',
          dosisHectarea: 100,
          unidad: 'kg',
          razon: 'Complemento nitrogenado para crecimiento vigoroso'
        }
      ],
      momentoOptimo: 'Aplicar en las primeras horas de la mañana con suelo húmedo',
      observaciones: [
        'Verificar humedad del suelo antes de aplicar',
        'Aplicar en banda cerca de las plantas',
        'Regar después de la aplicación si el suelo está seco'
      ],
      precauciones: [
        'Usar equipo de protección personal (guantes, mascarilla)',
        'Evitar aplicar con viento fuerte',
        'No aplicar si se espera lluvia en las próximas 24 horas'
      ]
    },
    'Control de Plagas': {
      insumos: [
        {
          nombre: 'Insecticida Cipermetrina 25%',
          dosisHectarea: 1.5,
          unidad: 'L',
          razon: `Control efectivo de insectos masticadores y chupadores en ${cultivo}`
        }
      ],
      momentoOptimo: 'Aplicar al atardecer cuando las plagas están más activas',
      observaciones: [
        'Realizar monitoreo previo para identificar nivel de infestación',
        'Aplicar con equipo calibrado',
        'Cubrir completamente el follaje'
      ],
      precauciones: [
        'Usar equipo de protección completo',
        'No aplicar con temperaturas superiores a 30°C',
        'Respetar periodo de carencia antes de cosecha'
      ]
    },
    'Control de Enfermedades': {
      insumos: [
        {
          nombre: 'Fungicida Mancozeb 80%',
          dosisHectarea: 2.5,
          unidad: 'kg',
          razon: `Control preventivo de enfermedades fungosas en ${cultivo}`
        }
      ],
      momentoOptimo: 'Aplicar preventivamente antes de periodos lluviosos',
      observaciones: [
        'Aplicar en cobertura total del follaje',
        'Repetir aplicación cada 7-14 días según condiciones',
        'Mayor eficacia en aplicación preventiva'
      ],
      precauciones: [
        'No mezclar con productos alcalinos',
        'Usar equipo de protección respiratoria',
        'Evitar aplicar con rocío excesivo'
      ]
    },
    'Fumigación': {
      insumos: [
        {
          nombre: 'Fungicida Mancozeb 80%',
          dosisHectarea: 2.5,
          unidad: 'kg',
          razon: `Control de hongos en ${cultivo}`
        }
      ],
      momentoOptimo: 'Aplicar en días nublados o al atardecer',
      observaciones: [
        'Verificar condiciones climáticas',
        'Calibrar equipo de fumigación',
        'Mantener presión constante'
      ],
      precauciones: [
        'Equipo de protección completo obligatorio',
        'No aplicar con viento superior a 10 km/h',
        'Mantener distancia de fuentes de agua'
      ]
    },
    'Riego': {
      insumos: [],
      momentoOptimo: 'Primeras horas de la mañana o al atardecer',
      observaciones: [
        `Aplicar aproximadamente ${hectareas * 300} m³ de agua`,
        'Verificar humedad del suelo antes de regar',
        'Evitar encharcamiento'
      ],
      precauciones: [
        'Verificar sistema de riego antes de iniciar',
        'Monitorear presión del sistema',
        'Evitar riego en horas de alta temperatura'
      ]
    }
  };

  // Retornar sugerencia según tipo o default a Fertilización
  return sugerenciasPorTipo[tipoAplicacion] || sugerenciasPorTipo['Fertilización'];
}

/**
 * Obtener sugerencia basada en historial de la parcela
 */
const obtenerSugerenciaConHistorial = async (req, res) => {
  // Por ahora, redirigir a la función principal
  return obtenerSugerenciaIA(req, res);
};

module.exports = {
  obtenerSugerenciaIA,
  obtenerSugerenciaConHistorial
};