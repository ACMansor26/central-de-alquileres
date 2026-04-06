# 📊 Data pipeline & real estate analytics: AMBA

> Solución de ingeniería de datos para la unificación y análisis del mercado inmobiliario fragmentado en Buenos Aires.

[![Data Architecture](https://img.shields.io/badge/Architecture-ETL_%7C_Data_Pipeline-blue)](https://github.com/TU-USUARIO)
[![Python](https://img.shields.io/badge/Python-Data_Extraction-3776AB?logo=python&logoColor=white)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Data_Warehouse-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Next.js](https://img.shields.io/badge/Next.js-Consumption_Layer-black?logo=next.js)](https://nextjs.org)

## El problema: Fragmentación de la oferta
La búsqueda de alquileres en el Área Metropolitana de Buenos Aires (AMBA) padece de una alta dispersión. Los usuarios se enfrentan al tedio de monitorear individualmente múltiples portales inmobiliarios, lidiando con información duplicada, datos inconsistentes y una experiencia de búsqueda fragmentada.

**Central de alquileres** nace como una respuesta técnica a esta problemática, funcionando como un **pipeline de datos unificado** que extrae, procesa y sirve la información en una única capa de consumo optimizada.

🌐 **[Visitar sitio web](https://central-de-alquileres.vercel.app/)**

---

## Arquitectura de la solución (End-to-End)

El proyecto se estructura como un sistema de datos robusto donde la interfaz web actúa simplemente como el visualizador de un proceso de ingeniería subyacente.

### 1. Ingesta multi-portal (Extraction)
* **Agregación de fuentes:** Scripts de Python diseñados para navegar y extraer datos de los principales portales del mercado argentino.
* **Consolidación de variables:** Unificación de esquemas de datos dispares en una estructura común (precio, moneda, expensas, ubicación, superficie).

### 2. Transformación y calidad del dato (Transform)
El core del proyecto reside en la capacidad de convertir datos sucios en información accionable:
* **Deduplicación inteligente:** Lógica para identificar la misma propiedad listada en diferentes sitios, evitando sesgos en el volumen de oferta real.
* **Estandarización de barrios:** Normalización de la cartografía de zonas del AMBA para eliminar discrepancias en las nomenclaturas de origen.
* **Limpieza de outliers:** Detección de anomalías en precios y metrajes para asegurar que las métricas finales sean representativas.

### 3. Almacenamiento y optimización (Load & storage)
Implementación sobre **PostgreSQL (Supabase)** utilizando técnicas avanzadas de base de datos:
* **Vistas materializadas:** Desacople de la lógica transaccional de la capa de consulta, permitiendo búsquedas instantáneas sobre datos pre-procesados.
* **Índices de trigramas:** Búsqueda difusa de alta velocidad para barrios y localidades, mejorando la UX en dispositivos móviles.

---

## Roadmap de evolución analítica

Este proyecto se encuentra en una fase de mejora continua bajo un enfoque de **Data-driven product**:

1. **Refinamiento de calidad (data precision):** Mejora de los algoritmos de limpieza para aumentar la precisión en la detección de duplicados y enriquecimiento de las variables geolocalizadas.
2. **Módulo de analítica visual:** Integración de componentes de visualización (Recharts/D3.js) para transformar la tabla de búsqueda en un dashboard de tendencias (Precio por m², evolución histórica y rentabilidad).
3. **Automatización de infraestructura:** Despliegue de orquestadores para la ejecución diaria programada del scraper en entornos cloud.

---

## Perfil profesional

Soy un **Data Engineer / Data Analyst** interesado en automatizar procesos de recolección de información y construir herramientas que aporten claridad a mercados complejos. Entiendo el desarrollo web como el medio para democratizar el acceso a la información estructurada.

* 💼 **LinkedIn:** [Conectar en LinkedIn](https://www.linkedin.com/in/amir-mansor25/)
* 📧 **Email:** [mansoramirc@gmail.com](mailto:mansoramirc@gmail.com)