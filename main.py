from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file, session
from weasyprint import HTML
from io import BytesIO
from db import get_db_connection
from add_new import add_new_transaction
from datetime import datetime, timedelta
import secrets
from consult import consult_despesas, consult_receita, consult_atual, consult_categorias_despesas, consult_ultimas_transacoes, consult_grafico_financeiro, consult_novo_relatorio, verificar_usuario, usuario_logado
from functools import wraps

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = session.get('token')
        if not usuario_logado(token):
            return redirect(url_for('login_page'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/financeiro/')
def login_page():
    return render_template('login.html')

@app.route('/financeiro_home', methods=['POST', 'OPTIONS', 'GET'])
@login_required
def financeiro_home():
    despesas = consult_despesas()
    receita = consult_receita()
    atual = consult_atual()
    return render_template('home.html', despesas=despesas, receita=receita, atual=atual)

@app.route('/financeiro/login', methods=['POST', 'OPTIONS'])
def login():
    data = request.get_json()
    usuario = data.get('usuario')
    senha = data.get('senha')
    user = verificar_usuario(usuario, senha)

    if user:
        session['token'] = user['token']
        return redirect(url_for('financeiro_home'))
    else:
        return jsonify({'success': False, 'message': 'Usuário ou senha inválidos'}), 401

@app.route('/financeiro/logout', methods=['POST'])
def logout():
    session.pop('token', None)
    return redirect(url_for('login_page'))

@app.route('/financeiro/add_new', methods=['POST', 'GET'])
def add_new():
    data = request.get_json()
    add_new_transaction(data['titulo'], data['valor'], data['categoria'], data['metodo'], data['tipo'])
    return jsonify({'success': True})

@app.route('/financeiro/categorias_despesas', methods=['GET'])
def categorias_despesas():
    resultados = consult_categorias_despesas()
    total = sum(r['SUM(valor)'] for r in resultados)
    categorias = []
    valores = []
    porcentagens = []

    for r in resultados:
        categoria = r['categoria']
        valor = r['SUM(valor)']
        categorias.append(categoria)
        valores.append(round(valor, 2))
        porcentagens.append(round((valor / total) * 100, 2))

    return jsonify({'categorias': categorias, 'valores': valores, 'porcentagens': porcentagens})

@app.route('/financeiro/ultimas_transacoes')
def ultimas_transacoes():
    transacoes = consult_ultimas_transacoes()
    return jsonify(transacoes)

@app.route('/financeiro/grafico')
def grafico_financeiro():
    meses = int(request.args.get('meses', 3))
    hoje = datetime.today()
    data_inicio = hoje - timedelta(days=30 * meses)
    data_inicio = data_inicio.strftime('%Y-%m-%d')
    resultados = consult_grafico_financeiro(data_inicio)
    dados = {}
    for row in resultados:
        mes = row['mes']
        if mes not in dados:
            dados[mes] = {'receita': 0, 'despesa': 0}
        if row['tipo'] == 'receita':
            dados[mes]['receita'] = float(row['total'])
        else:
            dados[mes]['despesa'] = float(row['total'])
    return jsonify(dados)

@app.route('/relatorio/pdf', methods=['POST'])
def gerar_relatorio_pdf():
    data_inicio = request.form.get('data_inicio')
    data_fim = request.form.get('data_fim')
    tipo = request.form.get('tipo')  # "Todos", "Receitas", "Despesas"
    categoria = request.form.get('categoria')
    transacoes = consult_novo_relatorio(data_inicio, data_fim, tipo, categoria)
    html = render_template('relatorio_pdf.html', transacoes=transacoes)
    pdf_io = BytesIO()
    HTML(string=html).write_pdf(pdf_io)
    pdf_io.seek(0)
    return send_file(pdf_io, mimetype='application/pdf', download_name='relatorio.pdf')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5220)
