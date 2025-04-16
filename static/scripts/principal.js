
let financeChart;

async function carregarGraficoFinanceiro(meses = 3) {
    const res = await fetch(`/financeiro/grafico?meses=${meses}`);
    const data = await res.json();
    
    console.log("Função carregarGraficoFinanceiro chamada");
    console.log('Dados recebidos do backend:', data);



    const labels = Object.keys(data).map(mes => {
        const [ano, mesNum] = mes.split("-");
        const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        return `${nomesMeses[parseInt(mesNum) - 1]} ${ano}`;
    });

    const receitas = Object.values(data).map(item => item.receita);
    const despesas = Object.values(data).map(item => item.despesa);

    const config = {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Receitas',
                    data: receitas,
                    backgroundColor: '#10b981',
                    borderRadius: 6
                },
                {
                    label: 'Despesas',
                    data: despesas,
                    backgroundColor: '#ef4444',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#f8fafc',
                        boxWidth: 12,
                        padding: 20
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    },
                    stacked: true
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function(value) {
                            return 'R$ ' + value.toLocaleString();
                        }
                    },
                    stacked: true
                }
            }
        }
    };

    if (financeChart) {
        financeChart.destroy(); // Atualiza se já existir
    }

    const ctx = document.getElementById('financeChart').getContext('2d');
    financeChart = new Chart(ctx, config);

}
let mostrarTodas = false;

async function carregarUltimasTransacoes() {
    const response = await fetch('/financeiro/ultimas_transacoes');
    const transacoes = await response.json();

    const container = document.querySelector('.space-y-3');
    container.innerHTML = ''; // Limpa conteúdo anterior


    const transacoesParaExibir = mostrarTodas ? transacoes : transacoes.slice(0, 5); // mostra só 5 no início

    transacoesParaExibir.forEach(gasto => {
        const isReceita = gasto.tipo === 'receita';
        const valorFormatado = parseFloat(gasto.valor).toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });

        const corTexto = isReceita ? 'text-green-400' : 'text-red-400';
        const corBg = isReceita ? 'bg-green-900' : 'bg-red-900';
        const icone = isReceita ? `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ` : `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        `;

        const html = `
            <div class="glass-card p-4 rounded-lg flex items-center justify-between transition transaction-card">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg ${corBg} bg-opacity-30 flex items-center justify-center">
                        ${icone}
                    </div>
                    <div>
                        <h3 class="font-medium">${gasto.titulo}</h3>
                        <p class="text-xs text-slate-400">${gasto.data} • ${gasto.categoria}</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-medium ${corTexto}">${isReceita ? '+' : '-'} ${valorFormatado}</p>
                    <p class="text-xs text-slate-400">${gasto.metodo}</p>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', html);
    });
}
document.getElementById('verTodasBtn').addEventListener('click', () => {
    mostrarTodas = !mostrarTodas;
    carregarUltimasTransacoes(mostrarTodas);

    const textoBotao = document.getElementById('verTodasTexto');
    textoBotao.textContent = mostrarTodas ? 'Ver menos' : 'Ver todas';
});


document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded disparado");
    carregarGraficoFinanceiro();
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 70,
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#6366f1"
            },
            "shape": {
                "type": "circle",
                "stroke": {
                    "width": 0,
                    "color": "#000000"
                }
            },
            "opacity": {
                "value": 0.5,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 1,
                    "opacity_min": 0.1,
                    "sync": false
                }
            },
            "size": {
                "value": 3,
                "random": true,
                "anim": {
                    "enable": false,
                    "speed": 40,
                    "size_min": 0.1,
                    "sync": false
                }
            },
            "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#6366f1",
                "opacity": 0.2,
                "width": 1
            },
            "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                    "enable": false,
                    "rotateX": 600,
                    "rotateY": 1200
                }
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": true,
                    "mode": "grab"
                },
                "onclick": {
                    "enable": true,
                    "mode": "push"
                },
                "resize": true
            },
            "modes": {
                "grab": {
                    "distance": 140,
                    "line_linked": {
                        "opacity": 1
                    }
                },
                "bubble": {
                    "distance": 400,
                    "size": 40,
                    "duration": 2,
                    "opacity": 8,
                    "speed": 3
                },
                "repulse": {
                    "distance": 200,
                    "duration": 0.4
                },
                "push": {
                    "particles_nb": 4
                },
                "remove": {
                    "particles_nb": 2
                }
            }
        },
        "retina_detect": true
    });

// Carregar gráfico inicial
document.addEventListener('DOMContentLoaded', () => {
    carregarGraficoFinanceiro();
    window.addEventListener('DOMContentLoaded', () => {
        carregarUltimasTransacoes(false); // exibe só as últimas inicialmente
    });

    document.getElementById('periodo-select').addEventListener('change', (e) => {
        const meses = parseInt(e.target.value);
        carregarGraficoFinanceiro(meses);
    });
});

    // Categories Chart
    const categoriesCtx = document.getElementById('categoriesChart').getContext('2d');
    const categoriesChart = new Chart(categoriesCtx, {
        type: 'doughnut',
        data: {
            labels: ['Contas - Casa', 'Alimentação', 'Transporte', 'Lazer', 'Saúde', 'Outros'],
            datasets: [{
                data: [35, 25, 15, 10, 8, 7],
                backgroundColor: [
                    '#ef4444',
                    '#f59e0b',
                    '#3b82f6',
                    '#8b5cf6',
                    '#10b981',
                    '#64748b'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#f8fafc',
                        boxWidth: 10,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
    async function atualizarGraficoCategorias() {
        const response = await fetch('/financeiro/categorias_despesas');
        const data = await response.json();
    
        // Atualizar dados do gráfico
        categoriesChart.data.labels = data.categorias;
        categoriesChart.data.datasets[0].data = data.porcentagens; // porcentagens ou valores
        categoriesChart.update();
    }
    
    // Chama a função ao carregar a página
    window.addEventListener('DOMContentLoaded', atualizarGraficoCategorias);
    

    // Report Modal
    const reportBtn = document.getElementById('reportBtn');
    const reportModal = document.getElementById('reportModal');
    const closeReportModal = document.getElementById('closeReportModal');

    reportBtn.addEventListener('click', () => {
        reportModal.classList.remove('hidden');
    });

    closeReportModal.addEventListener('click', () => {
        reportModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    reportModal.addEventListener('click', (e) => {
        if (e.target === reportModal) {
            reportModal.classList.add('hidden');
        }
    });
});

function formatarVisualmente(elemento) {
    let valor = elemento.value;

    // Remove tudo que não for número
    valor = valor.replace(/\D/g, '');

    if (valor.length === 0) {
        elemento.value = '';
        return;
    }

    // Converte para número e divide por 100 para pegar os centavos
    valor = (parseFloat(valor) / 100).toFixed(2);

    // Separa parte inteira e decimal
    let partes = valor.split('.');
    let inteiro = partes[0];
    let decimal = partes[1];

    // Adiciona pontos como separador de milhar
    inteiro = inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Monta resultado final
    elemento.value = `R$ ${inteiro},${decimal}`;
}

document.getElementById("receita").addEventListener("change", function () {
    const categoriaInput = document.getElementById("categoria");
    if (this.checked) {
        categoriaInput.value = "Outros";
        categoriaInput.disabled = true;
    }
});

document.getElementById("despesa").addEventListener("change", function () {
    const categoriaInput = document.getElementById("categoria");
    if (this.checked) {
        categoriaInput.value = "";
        categoriaInput.disabled = false;
    }
});

async function includeTransaction() {
    const titulo = document.getElementById("titulo").value;
    const valorFormatado = document.getElementById("valor").value;
    const valor = parseFloat(valorFormatado
        .replace("R$", "")
        .replace(/\./g, "")
        .replace(",", ".")
        .trim()
    );
    const categoria = document.getElementById("categoria").value;
    const metodo = document.getElementById("metodo").value;
    const tipoSelecionado = document.querySelector('input[name="tipo"]:checked');

    try {
        const response = await fetch('/financeiro/add_new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ titulo, valor, categoria, metodo, tipo: tipoSelecionado ? tipoSelecionado.value : null  }),
        });

        const data = await response.json();

        if (data.success) {
            location.reload()
        } else {
            alert(data.message || "Login Failed.");
        }
    } catch (error) {
        console.log('Error during login authentication', error);
    }
};
window.addEventListener('DOMContentLoaded', carregarUltimasTransacoes);