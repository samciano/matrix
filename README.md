# Matrix Village — Protótipo local

Primeira implementação jogável de uma simulação social de vila com habitantes autônomos. O projeto usa HTML, CSS e JavaScript puro. Não utiliza IA generativa, serviços externos ou banco de dados.

## Como executar

Baixe e extraia o arquivo ZIP. Abra `index.html` em um navegador moderno. A interface foi feita para funcionar localmente sem etapa de compilação.

Se o navegador restringir a abertura de arquivos locais, execute um servidor HTTP na pasta do projeto. Com Python instalado, abra o terminal nessa pasta e execute:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## O que foi implementado

A população inicial contém 30 habitantes gerados proceduralmente. Cada habitante possui identidade, idade, sexo, um tipo MBTI, 40 traços permanentes em escala de 0 a 100, estados dinâmicos, objetivos e memória recente.

O MBTI é tratado como uma influência de arquétipo, não como uma definição completa da personalidade. As quatro dimensões modificam tendências iniciais: extroversão/introversão afeta sociabilidade e reserva; sensação/intuição afeta praticidade, curiosidade e criatividade; pensamento/sentimento afeta análise, empatia e sensibilidade; julgamento/percepção afeta planejamento, disciplina e improvisação. Os traços numéricos continuam individuais e não são substituídos pelo tipo.

Os 40 traços permanentes estão distribuídos entre dimensões psicológicas, cognitivas, emocionais, sociais, motivacionais, afetivas, morais, comportamentais e biológicas. Eles são gerados uma vez na criação do habitante. Nesta versão, os estados dinâmicos incluem fome, energia, humor, estresse, necessidade social, saúde e romance.

A tomada de decisão utiliza pontuações de utilidade. A cada hora, o habitante avalia necessidades e tendências e escolhe entre comer, dormir, socializar, trabalhar, explorar ou evitar contato. Não existe diálogo textual: interações sociais alteram afinidade, confiança, familiaridade e conflito. Personalidade e estado atual influenciam a chance e o resultado dessas interações.

Cada par de habitantes possui um registro de relação. Os residentes guardam memórias recentes de eventos sociais. Objetivos pessoais são derivados de tendências individuais. A manutenção diária contém uma primeira regra experimental para formação de relacionamentos e nascimento de filhos, limitada a uma população de 80 habitantes.

## Interface

A tela apresenta uma visão superior da vila em fundo preto, com habitantes representados por pontos brancos. Ao passar o cursor sobre um ponto, aparece o nome, o MBTI, a idade e a atividade atual; clicar seleciona o habitante e abre sua ficha. O mapa mostra uma grade discreta e zonas de referência. Indicadores temporários aparecem junto aos habitantes durante ações como alimentação, sono, trabalho e exploração. Interações sociais são destacadas por linhas entre os envolvidos: ciano para interações amigáveis e vermelho tracejado para conflitos. A tela também contém indicadores agregados, registro de acontecimentos, lista pesquisável de habitantes e ficha individual. Na ficha é possível observar o MBTI, estado atual, amostra dos traços permanentes, objetivos, relações mais relevantes e memórias recentes.

Os controles permitem iniciar ou pausar a simulação, avançar uma hora, alterar a velocidade e gerar uma nova população.

## Estrutura de arquivos

```text
matrix_village/
├── index.html
├── README.md
├── css/
│   └── style.css
└── js/
    ├── data.js
    ├── simulation.js
    ├── ui.js
    └── app.js
```

`data.js` contém nomes, tipos MBTI, catálogo de traços e rótulos de ações. `simulation.js` contém a população, estados, relações, memória, utilidade e avanço do tempo. `ui.js` renderiza os dados na interface. `app.js` conecta os controles à simulação.

## Limitações conhecidas desta primeira versão

A vila ainda não possui navegação espacial real, casas individuais, inventário, economia, profissões especializadas, árvore genealógica visual, reprodução genética, sistema de herança, ciclo de vida completo ou envelhecimento automático. O relacionamento e a reprodução são regras experimentais simplificadas, destinadas a validar o fluxo geral antes de aprofundar o modelo.

Os traços são apresentados integralmente no objeto de cada residente, mas a interface exibe uma seleção dos principais. As decisões são atualizadas em intervalos horários e as oportunidades sociais são processadas periodicamente; não há simulação contínua por agente.

## Próximas etapas técnicas recomendadas

A próxima evolução deve separar atributos permanentes, estados temporários e parâmetros biológicos em estruturas explícitas; criar um modelo de compatibilidade e desenvolvimento de relações mais robusto; implementar envelhecimento, parentesco e herança; e adicionar inspeção de todos os 40 traços, histórico de eventos e ferramentas de depuração da utilidade escolhida por cada residente.
