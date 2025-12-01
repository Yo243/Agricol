// backend/src/controllers/aplicacion-ia.controller.js

const Anthropic = require('@anthropic-ai/sdk');

/**
 * Obtiene sugerencias de IA para una aplicación de insumos
 */
const obtenerSugerenciaIA = async (req, res) => {
  try {
    const { cultivo, tipoAplicacion, hectareas, etapaCultivo, parcelaInfo } = req.body;

    // Validar datos requeridos
    if (!cultivo || !tipoAplicacion) {
      return res.status(400).json({
        error: 'Cultivo y tipo de aplicación son requeridos'
      });
    }

    // Inicializar cliente de Claude
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || 'tu-api-key-aqui',
    });

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

    // Llamar a Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extraer respuesta
    let responseText = message.content[0].text;
    
    // Limpiar respuesta (remover markdown si existe)
    responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parsear JSON
    const sugerencia = JSON.parse(responseText);

    // Retornar sugerencia
    res.json({
      success: true,
      sugerencia,
      generadoEn: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error al obtener sugerencia de IA:', error);
    
    // Si es error de parsing JSON, intentar con respuesta de respaldo
    if (error instanceof SyntaxError) {
      return res.status(200).json({
        success: true,
        sugerencia: {
          insumos: [
            {
              nombre: "Fertilizante NPK 15-15-15",
              dosisHectarea: 200,
              unidad: "kg",
              razon: "Suministra nutrientes balanceados esenciales"
            }
          ],
          momentoOptimo: "Durante las primeras etapas de crecimiento vegetativo",
          observaciones: [
            "Aplicar en suelo húmedo",
            "Evitar aplicación en días muy calurosos"
          ],
          precauciones: [
            "Usar equipo de protección personal",
            "Respetar dosis recomendadas"
          ]
        },
        generadoEn: new Date().toISOString(),
        fallback: true
      });
    }

    res.status(500).json({
      error: 'Error al generar sugerencia',
      mensaje: error.message
    });
  }
};

/**
 * Obtener sugerencia basada en historial de la parcela
 */
const obtenerSugerenciaConHistorial = async (req, res) => {
  try {
    const { parcelaId, cultivo, tipoAplicacion } = req.body;

    // Aquí puedes consultar el historial de aplicaciones de la parcela
    // const historial = await pool.query('SELECT ...');

    // Por ahora, redirigir a la función principal
    return obtenerSugerenciaIA(req, res);

  } catch (error) {
    console.error('Error al obtener sugerencia con historial:', error);
    res.status(500).json({
      error: 'Error al generar sugerencia',
      mensaje: error.message
    });
  }
};

module.exports = {
  obtenerSugerenciaIA,
  obtenerSugerenciaConHistorial
};