# ⚖️ ScholaIA: Mapa Legal y Cumplimiento Normativo
*Marco Integral: Protección de Datos, Ley de IA de la UE, Contratación Pública y Fiscalidad*
*Fecha de actualización: 15 de agosto de 2026*

> [!NOTE]
> **Aviso Orientativo:** Elaborado con información jurídica oficial verificada en agosto de 2026. Sirve de hoja de ruta operativa para los socios antes de la firma de contratos y publicación de textos legales.

---

## 🌐 1. Textos Legales de la Web Corporativa (LSSICE)
Conforme a la **Ley 34/2002 (LSSI-CE)** obligatoria para servicios digitales en España:
* **Aviso Legal:** Identificación del titular (NIF, domicilio, contacto, denominación social). *(Redactado)*
* **Política de Privacidad Web:** Tratamiento de datos en formularios corporativos y captación de leads. *(Redactada)*
* **Política de Cookies:** Aviso informativo y panel de configuración de cookies técnicas/analíticas. *(Redactada)*

---

## 🔒 2. Protección de Datos Personales (RGPD / LOPDGDD)
Marco: **Reglamento (UE) 2016/679** y **Ley Orgánica 3/2018**:
* **Contrato de Encargado del Tratamiento (Art. 28 RGPD):** Anexo obligatorio a firmar con cada colegio para delimitar responsabilidades. *(Redactado)*
* **Política de Privacidad del Widget:** Texto específico accesible desde el chat para informar al usuario final (alumnos, familias) sobre el tratamiento de sus consultas. *(Redactada en `aviso_privacidad_widget.md`, comprobada contra el código. Antes de publicarla hay que resolver cuatro puntos: si el plan contratado con Google permite afirmar que no se entrena con las conversaciones, en qué región trata Google los datos y con qué garantía, si el centro usa `webhook` como destino de las solicitudes, y qué hacer con las preguntas que escribe una familia en el botón de Essential, que son texto libre y pueden acabar conteniendo datos de salud de un menor pese a la anonimización automática. Debe revisarla un abogado.)*
* **Registro de Actividades de Tratamiento (RAT, Art. 30 RGPD):** Documento interno obligatorio que detalla categorías de datos, finalidades, plazos y medidas técnicas de seguridad.
* **Evaluación de Impacto (EIPD / DPIA, Art. 35 RGPD):** Relevante para el módulo de orientación de 4º ESO por tratar datos de menores y evaluación vocacional.
* **Consentimiento de Menores (Art. 7 LOPDGDD):** 
  * En España, los **mayores de 14 años** pueden consentir válidamente por sí mismos el tratamiento de sus datos. 
  * Los alumnos de 4º de la ESO (15-16 años) cuentan con capacidad legal de consentimiento directo, aunque se recomienda transparencia con las familias.
* **Política de Retención y Borrado:** Establecer plazos concretos de purga automática de logs en lugar de fórmulas genéricas.

---

## 🤖 3. Reglamento Europeo de Inteligencia Artificial (AI Act - UE 2024/1689)

> [!WARNING]
> **En vigor desde el 2 de agosto de 2026:**
> El Anexo III, punto 3, letra c) clasifica como **Sistemas de IA de ALTO RIESGO** a aquellos destinados a *"evaluar el nivel de educación adecuado que recibirá una persona o al que podrá acceder"* en centros educativos.

### 🛡️ Vía de Excepción Aplicada (Art. 6.3 de la Ley de IA):
* Un sistema **NO se considera de alto riesgo** si realiza tareas puramente preparatorias o de apoyo, sin influir de forma sustancial en la decisión final.
* **Diseño del Módulo 4º ESO en ScholaIA:**
  1. El chatbot emite un **informe orientativo no vinculante**, diseñado exclusivamente como herramienta de apoyo preliminar.
  2. La **decisión final corresponde siempre al orientador humano** y al propio alumno/familia.
  3. Queda documentada y visible la supervisión humana: el orientador del centro revisa, matiza o descarta las sugerencias del asistente.

---

## 🏛️ 4. Contratación con Centros Públicos (IES) y Privados
* **Centros Concertados y Privados:** Contrato mercantil marco (Términos del Servicio: SLA, precio, responsabilidades) + Anexo Art. 28 RGPD.
* **Institutos Públicos (IES):**
  * **Contrato Menor de Servicios:** Vía directa hasta **15.000 € / año** sin licitación pública compleja, aprobable directamente por la dirección del centro.
  * **Facturación Electrónica FACe:** Emisión de facturas oficiales con códigos DIR3 del centro.
  * **Accesibilidad Web (RD 1112/2018 / UNE-EN 301549):** Cumplimiento de contraste, navegación por teclado y lectores de pantalla en el widget.
  * **Esquema Nacional de Seguridad (ENS):** A tener en cuenta a medida que crezca la cartera de centros públicos.

---

## 💶 5. Aspectos Fiscales y Societarios
* **VERI*FACTU:** Obligatoriedad desde 2026 de utilizar software de facturación homologado por la Agencia Tributaria.
* **Facturación Electrónica B2B (Ley Crea y Crece):** Entrada en vigor en 2028 para pymes y autónomos con facturación inferior a 8M€.
* **Estructura Societaria:** Arranque como Sociedad Civil / RETA Tarifa Plana -> Transición a **Sociedad Limitada (S.L.)** al consolidar clientes recurrentes.
* **Propiedad Intelectual:** Registro de marca `ScholaIA` ante la OEPM y titularidad propia del software.

---

## 🚦 6. Checklist Priorizado de Cumplimiento

| Prioridad | Obligación / Documento | Momento de Implementación |
| :--- | :--- | :--- |
| 🔴 **Urgente** | Contrato de Encargado de Tratamiento (Art. 28 RGPD) | Antes del primer colegio *(Listo)* |
| 🔴 **Urgente** | Política de Privacidad del Widget / Chatbot | Antes del despliegue en producción *(Redactada: `aviso_privacidad_widget.md`. Pendiente de resolver 3 puntos y de revisión por abogado)* |
| 🔴 **Urgente** | Software de facturación homologado (VERI*FACTU) | Operativo en 2026 |
| 🟡 **Alta** | Términos y Condiciones del Servicio (Contrato Marco) | Antes de firmar clientes de pago |
| 🟡 **Alta** | Protocolo de notificación de incidentes (72h AEPD) | Elaborado y activo *(Listo)* |
| 🟡 **Alta** | Registro de Actividades de Tratamiento (RAT) | Primeros 2-3 colegios |
| 🟢 **Media** | Documentación de Excepción Art. 6.3 Ley de IA (4º ESO) | Antes de escalar módulo vocacional |
| 🟢 **Media** | Evaluación de Impacto (EIPD) Módulo 4º ESO | Previo a despliegue masivo |
| 🟢 **Media** | Registro de Marca ante la OEPM | Al fijar el nombre definitivo |
| ⚪ **Futuro** | Facturación B2B Ley Crea y Crece | 2027 - 2028 |
