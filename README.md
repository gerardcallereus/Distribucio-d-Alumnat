# Distribució d'Alumnat i Grups de Treball 🪑🤝

Aplicació web per a docents que permet gestionar la col·locació a l'aula i crear grups de treball de forma equitativa i participativa.

## Funcionalitats

### 1. 🪑 Taules d'Aula (Distribució física)
- Distribució equitativa de l'alumnat a les taules de classe.
- Control de capacitat màxima per taula i avís en temps real en cas d'excedir el límit.
- Repartiment **Aleatori** o per **Ordre d'entrada**.
- Eines per remenar, ordenar alfabèticament, copiar el resultat al portapapers i imprimir.

### 2. 🤝 Grups de Treball (Metodologia de Veto i Consens)
- Metodologia participativa d'aula amb **Dret a Veto Únic**:
  - Els alumnes es reparteixen de manera equitativa en grups de treball inicials (**Provisionals ⏳**).
  - Cada alumne disposa de **només 1 vot de desacord** durant tota la sessió.
  - Si un alumne prem **"✋ En desacord"**, el seu veto queda consumit (ja no pot tornar a votar en contra) i **tot el grup queda impugnat ❌**.
  - En prémer **"🔄 Redistribuir impugnats"**, els membres dels grups impugnats tornen a entrar en una bossa de repartiment aleatori exclusiva per a aquests grups.
  - Els grups que no tenen queixes es poden validar com a **Definitius 🔒** per consens.
  - **Regla automàtica de tancament**: Si un grup es forma amb membres que **tots ja han exercit el seu veto anteriorment**, el grup esdevé automàticament **Definitiu 🔒** (ja ningú té dret a vetar-lo).
  - El procés es completa quan tots els grups assoleixen l'estat definitiu.

## Com executar localment

L'aplicació està disponible a:
**[http://localhost:3000](http://localhost:3000)**

Per engegar manualment el servidor web:
```bash
python3 -m http.server 3000
```
