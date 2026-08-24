# 🏗️ ScholaIA: Infraestructura Técnica y Estructura de Costes
*Análisis Operativo y Financiero para Despliegue en Centros Educativos*
*Fecha de actualización: Agosto 2026*

---

## 🖥️ 1. Infraestructura Base Imprescindible

Componentes técnicos obligatorios para garantizar la alta disponibilidad, seguridad y aislamiento de los colegios:

1. **Servidor VPS (Virtual Private Server):**
   * *Especificaciones:* 8 GB de RAM, 2 vCPU, 500 Mbit/s de red y 40 GB de disco SSD NVMe.
   * *Coste:* **18 € / mes**.
   * *Uso:* Aloja el backend Node.js/Express, la base de datos de FAQs/solicitudes y la entrega del widget de chat.
2. **Dominio Propio:**
   * *Ejemplo:* `scholaia.es` o subdominios específicos.
   * *Coste:* **12 - 15 € / año** (~1 € / mes).
3. **Certificado SSL / TLS:**
   * *Proveedor:* Let's Encrypt / Certbot con auto-renovación gratuita.
   * *Coste:* **0 €**.
4. **Base de Datos Multi-Tenant:**
   * *Arquitectura:* Aislamiento lógico por `colegio_id` dentro del backend, sin coste adicional.
   * *Coste:* **0 €**.
5. **API de Inteligencia Artificial (Google Gemini 1.5 Flash):**
   * *Modelo:* Gemini 1.5 Flash (alta velocidad, tokens ultrabaratos y ventana de contexto extendida).
   * *Coste Variable:* Entre **0,20 € y 4,00 € / mes** por colegio activo según volumen de consultas.
6. **Backups Automáticos y Monitorización:**
   * Snapshots periódicos del VPS y alertas automáticas de uptime (UptimeRobot / BetterUptime gratuito).
   * *Coste:* **0 €**.

---

## 💰 2. Tabla de Costes Operativos Mensuales

| Concepto | Coste Mensual Aprox. | Tipo de Gasto | Estado |
| :--- | :--- | :--- | :--- |
| **Servidor VPS (8GB RAM, 2 vCPU, 40GB)** | 18,00 € | Fijo | Imprescindible |
| **Dominio Propio (`scholaia.es`)** | ~1,00 € (12-15 €/año) | Fijo | Imprescindible |
| **Certificado SSL (Let's Encrypt)** | 0,00 € | Gratuito | Activo |
| **Hosting de Widget y Backend** | 0,00 € (mismo VPS) | Gratuito | Activo |
| **Copias de Seguridad (Backups VPS)** | 0,00 € (incluido en VPS) | Fijo | Activo |
| **Monitorización de Uptime** | 0,00 € (tier gratuito) | Fijo | Activo |
| **API de Gemini (por cada colegio activo)** | 0,20 € – 4,00 € / colegio | Variable | Según tráfico |
| **TOTAL ESTIMADO (5 Colegios Activos)** | **≈ 30,00 € – 40,00 € / mes** | **Mixto** | **Altamente Rentable** |

---

## 📈 3. Hoja de Ruta de Escalabilidad (Extras)

### 🟢 3.1. Extras Recomendados (Corto Plazo / Aporte Inmediato)
* **Panel de Administración Multi-Colegio:** Vista global centralizada para los socios con selector de centros.
* **Métricas y Analítica de Preguntas:** Identificación de consultas sin respuesta para enriquecer la base de datos de cada centro.
* **Canal de Soporte Estructurado:** Sistema de tickets ordenado para evitar saturación por WhatsApp.
* **Pentesting Ligero:** Revisión de vulnerabilidades antes de licitaciones públicas o superar 10 colegios.

### 🟡 3.2. Extras de Nivel Medio (Medio Plazo)
* **CDN para el Widget (Cloudflare):** Cacheo y aceleración de carga del script en las webs escolares.
* **Separación de Base de Datos:** Instancia gestionada de PostgreSQL/MongoDB fuera del VPS cuando el volumen escale.
* **SLA Formal con Tiempos de Respuesta Garantizados.**

### ⚪ 3.3. Extras Prescindibles (No Prioritarios)
* Modelos LLM *self-hosted* con GPU propia (coste innecesario frente a la API de Gemini).
* Infraestructura multi-región internacional.
* Certificación formal ISO 27001 en etapas iniciales.
