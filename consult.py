import mysql.connector
from datetime import datetime
from db import get_db_connection

def consult_despesas():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT SUM(valor) FROM transacoes WHERE tipo = 'despesa'"
    cursor.execute(query)
    resultado = cursor.fetchone()
    resultado['SUM(valor)'] if resultado else 0
    total = resultado['SUM(valor)'] if resultado['SUM(valor)'] else 0
    valor_formatado = f"{total:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return valor_formatado

def consult_receita():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT SUM(valor) FROM transacoes WHERE tipo = 'receita'"
    cursor.execute(query)
    resultado = cursor.fetchone()
    resultado['SUM(valor)'] if resultado else 0
    total = resultado['SUM(valor)'] if resultado['SUM(valor)'] else 0
    valor_formatado = f"{total:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return valor_formatado

def consult_atual():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    query = "SELECT SUM(valor) FROM transacoes WHERE tipo = 'despesa'"
    cursor.execute(query)
    resultado2 = cursor.fetchone()
    resultado2['SUM(valor)'] if resultado2 else 0

    query = "SELECT SUM(valor) FROM transacoes WHERE tipo = 'receita'"
    cursor.execute(query)
    resultado1 = cursor.fetchone()
    resultado1['SUM(valor)'] if resultado1 else 0

    atual = resultado1['SUM(valor)'] - resultado2['SUM(valor)']
    valor_formatado = f"{atual:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return valor_formatado

def consult_categorias_despesas():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
        SELECT categoria, SUM(valor) 
        FROM transacoes 
        WHERE tipo = 'despesa' 
        GROUP BY categoria
    """)
    resultados = cursor.fetchall()

    cursor.close()
    conn.close()

    return resultados

def consult_ultimas_transacoes():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("""
        SELECT titulo, valor, categoria, metodo, tipo, data
        FROM transacoes
        ORDER BY id_transacao DESC
    """)
    transacoes = cursor.fetchall()

    cursor.close()
    conn.close()
    return transacoes

def consult_grafico_financeiro(data_inicio):

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("""
    SELECT 
        DATE_FORMAT(data_formatada, '%Y-%m') as mes,
        tipo,
        SUM(valor) as total
    FROM transacoes
    WHERE data_formatada >= %s
    GROUP BY mes, tipo
    ORDER BY mes ASC;
    """, (data_inicio,))
   
    resultados = cursor.fetchall()
    cursor.close()
    conn.close()
    return resultados

def consult_novo_relatorio(data_inicio, data_fim, tipo, categoria):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    # Monta filtro SQL dinamicamente
    query = "SELECT * FROM transacoes WHERE 1=1"
    params = []

    if data_inicio:
        query += " AND STR_TO_DATE(data, '%d/%m/%Y') >= %s"
        params.append(data_inicio)
    if data_fim:
        query += " AND STR_TO_DATE(data, '%d/%m/%Y') <= %s"
        params.append(data_fim)
    if tipo and tipo.lower() != 'todos':
        query += " AND tipo = %s"
        params.append(tipo.lower())
    if categoria and categoria.lower() != 'todas':
        query += " AND categoria = %s"
        params.append(categoria)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(query, tuple(params))
    transacoes = cursor.fetchall()
    cursor.close()
    conn.close()

    return transacoes

def verificar_usuario(usuario, senha):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT token FROM usuarios WHERE usuario = %s AND senha = %s", (usuario, senha))
    token = cursor.fetchone()
    cursor.close()
    conn.close()
    return token

def usuario_logado(token):
    if not token:
        return False

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM usuarios WHERE token = %s", (token,))
    result = cursor.fetchone()
    cursor.close()
    conn.close()

    return result is not None
