import pymysql

def get_db_connection():
    return pymysql.connect(
        host='localhost',
        user='user,
        password='senha',
        database='tabela',
        cursorclass=pymysql.cursors.DictCursor
    )
