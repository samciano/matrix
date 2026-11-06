/* Dados estáticos e parâmetros de geração. */
const DATA = {
  firstNames: ["Ana","Beatriz","Caio","Davi","Elisa","Felipe","Gabriel","Helena","Ícaro","Julia","Lucas","Marina","Nicolas","Olivia","Pedro","Rafaela","Sofia","Tiago","Valentina","Vicente","Alice","Bruno","Clara","Daniel","Eduarda","Fabio","Giovana","Heitor","Isabela","João","Laura","Miguel","Noah","Paula","Ravi","Sara","Theo","Yasmin"],
  surnames: ["Almeida","Barros","Campos","Duarte","Esteves","Ferreira","Gomes","Lima","Mendes","Nogueira","Oliveira","Pereira","Ramos","Silva","Teixeira","Vieira"],
  mbti: ["ISTJ","ISFJ","INFJ","INTJ","ISTP","ISFP","INFP","INTP","ESTP","ESFP","ENFP","ENTP","ESTJ","ESFJ","ENFJ","ENTJ"],
  /* 40 traços permanentes, em escala de 0 a 100. */
  traits: [
    ["sociabilidade","Psicológico"],["assertividade","Psicológico"],["energia_social","Psicológico"],["reserva","Psicológico"],["curiosidade","Cognitivo"],
    ["criatividade","Cognitivo"],["pensamento_analitico","Cognitivo"],["abertura_experiencias","Cognitivo"],["praticidade","Cognitivo"],["planejamento","Cognitivo"],
    ["impulsividade","Emocional"],["estabilidade_emocional","Emocional"],["sensibilidade","Emocional"],["tolerancia_frustracao","Emocional"],["otimismo","Emocional"],
    ["empatia","Social"],["cooperatividade","Social"],["competitividade","Social"],["confianca_inicial","Social"],["necessidade_aprovacao","Social"],
    ["lealdade","Social"],["generosidade","Motivacional"],["ambicao","Motivacional"],["persistencia","Motivacional"],["autonomia","Motivacional"],
    ["romantismo","Afetivo"],["ciume","Afetivo"],["libido","Afetivo"],["necessidade_vinculo","Afetivo"],["sociabilidade_romantica","Afetivo"],
    ["honestidade","Moral"],["altruismo","Moral"],["rigidez_moral","Moral"],["espiritualidade","Moral"],["agressividade","Comportamental"],
    ["coragem","Comportamental"],["disciplina","Comportamental"],["tolerancia_risco","Comportamental"],["resistencia_fisica","Biológico"],["vitalidade","Biológico"]
  ],
  mbtiEffects: {
    E:{sociabilidade:13,energia_social:15,reserva:-10}, I:{sociabilidade:-12,energia_social:-10,reserva:14},
    S:{praticidade:14,curiosidade:-3}, N:{curiosidade:14,criatividade:12,abertura_experiencias:10},
    T:{pensamento_analitico:13,sensibilidade:-5}, F:{empatia:13,sensibilidade:12},
    J:{planejamento:14,disciplina:12}, P:{impulsividade:8,tolerancia_risco:8,planejamento:-12}
  },
  actions: {
    idle:"Descansando", eat:"Fazendo uma refeição", sleep:"Dormindo", socialize:"Interagindo", work:"Trabalhando", explore:"Explorando", avoid:"Evitando contato", argue:"Em conflito"
  }
};
