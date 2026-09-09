# Distribució d'Alumnat a l'Aula 🪑

Aplicació web dissenyada per a docents que permet organitzar i repartir alumnes en taules de forma equitativa i automàtica.

## Característiques

- **Configuració de l'aula**:
  - Nombre de taules configurables amb selectors incrementals (+ / -).
  - Capacitat màxima d'alumnes per taula.
  - Càlcul dinàmic de la capacitat total de l'aula en temps real.
- **Entrada d'alumnat**:
  - Àrea de text amb un alumne per línia.
  - Comptador automàtic d'alumnes introduïts.
  - Botó per ordenar alfabèticament la llista (A-Z).
  - Botó per buidar la llista.
  - Botó per carregar dades d'exemple ràpides.
- **Algorisme de repartiment equitatiu**:
  - Distribueix l'alumnat garantint que cap taula difereixi en més d'un alumne respecte de les altres.
  - Respecta la capacitat màxima de cada taula.
  - Alerta immediata en cas que el nombre d'alumnes superi la capacitat màxima total, indicant quins alumnes queden sense taula.
  - Dos modes d'assignació:
    - **🎲 Aleatori**: Barreja a l'atzar l'alumnat (Fisher-Yates).
    - **📝 Ordre de llista**: Respecta l'ordre original d'entrada.
- **Eines addicionals**:
  - 🔄 **Remenar**: Torna a generar una nova combinació a l'atzar amb un sol clic.
  - 📋 **Copiar**: Copia el resum de totes les taules directament al portapapers.
  - 🖨️ **Imprimir / PDF**: Estils CSS preparats per imprimir directament o desar en PDF net per portar a l'aula.

## Com executar localment

L'aplicació està activa a:
**[http://localhost:3000](http://localhost:3000)**

Si vols tornar a arrencar el servidor:
```bash
python3 -m http.server 3000
```
