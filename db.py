import mysql.connector

def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        user='prod',
        password='prod01',
        database='transacoes'
    )