FROM python:3.11-slim

# Imposta l'ambiente di lavoro
WORKDIR /app
COPY requirements.txt .

# Installa le dipendenze
RUN pip install --no-cache-dir -r requirements.txt

# Copia il codice dell'applicazione
COPY . .

# La porta standard per Gunicorn/Cloud Run è 8080 (esponi solo per documentazione)
EXPOSE 8080

# Utilizza gunicorn per avviare l'app sulla porta 8080, compatibile con l'ambiente Docker
# NON usiamo $PORT qui, usiamo la porta fissa 8080.
CMD ["gunicorn", "-b", "0.0.0.0:8080", "app:app"]