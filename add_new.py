import mysql.connector
from datetime import datetime
from db import get_db_connection

def add_new_transaction(titulo, valor, categoria, metodo, tipo):
    data = datetime.now().strftime('%d/%m/%Y')
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO transacoes (tipo, valor, data, titulo, categoria, metodo) VALUES (%s, %s, %s, %s, %s, %s)",
                    (tipo, valor, data, titulo, categoria, metodo))
    conn.commit()
    cursor.execute("UPDATE transacoes SET data_formatada = STR_TO_DATE(data, '%d/%m/%Y') WHERE STR_TO_DATE(data, '%d/%m/%Y') IS NOT NULL;")
    conn.commit()
    cursor.close()
    conn.close()
    print("Transactions Added")
