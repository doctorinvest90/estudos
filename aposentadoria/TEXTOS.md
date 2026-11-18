# Calculadora da aposentadoria: textos para aprovação

Tudo que o público ou um lead lê, transcrito do código. Marque o que mudar. Nada vai ao ar antes do seu ok.
Os trechos entre `{chaves}` são números que a página calcula.

## Números da conta (só para a sua decisão; não vão à página)

**Premissas medidas (nov/2026)**
- Rendimento real antes das tarifas (rReal): **4,46% a.a.** (CDI e IPCA, BCB/SGS, 2006–2025).
- Fundos: **0,65% a.a.** Mediana da taxa de administração paga pelo cotista típico de fundos de renda fixa e multimercado de varejo dos cinco maiores bancos, ponderada pelo número de cotistas; ficam de fora classes com taxa zero, ausente ou acima de 10%; previdência fora da medida.
- Direto: **0,20% a.a.** (custódia B3 do Tesouro Direto). Custo baixo: **0,20% a.a.** (mesma fonte).
- Alvo = 300 vezes a renda mensal.

**Caso-base:** 42 anos, parar aos 60, R$ 800.000 investidos, renda R$ 30.000/mês, aporte R$ 15.000/mês, fundos.
- Alvo: R$ 9.000.000.
- Idade em que atinge: **66 anos com a tarifa** (66,17) e **65 anos com custo baixo** (65,00). Diferença na página: **1 ano**; exata: 1,17 ano.
- Aporte mensal necessário para parar aos 60: **R$ 24.155 com a tarifa** e **R$ 22.735 com custo baixo** (diferença R$ 1.420/mês).
- Patrimônio aos 60 anos mantendo o aporte de hoje: R$ 6.183.348 com a tarifa; R$ 6.514.692 com custo baixo. **Diferença: R$ 331.345** (mesma fórmula mensal; nenhum dos dois chega aos R$ 9 mi aos 60).
- Custo anual da tarifa sobre o investido hoje: R$ 5.200.

## 1. Cabeçalho e campos

- Marca: DOCTOR INVEST · CALCULADORA
- Título da aba: Quanto a tarifa atrasa sua aposentadoria · Doctor Invest
- Título: **Quanto a tarifa atrasa a sua aposentadoria**
- Subtítulo: Cinco números, um minuto. O resultado aparece na tela, sem cadastro.
- Caixa: **Seus números**
- Dica: Sem imóvel. Valores em dinheiro de hoje.
- Campos (valores iniciais: 40 e 60 anos):
  - Sua idade hoje (anos)
  - Quer parar aos (anos)
  - Quanto você tem investido hoje (banco, corretora, previdência) (R$)
  - Renda mensal que quer na aposentadoria (R$ /mês)
  - Quanto você investe por mês hoje (0 se não investe) (R$ /mês)
  - Onde está a maior parte? Opções:
    - Fundos ou previdência (banco ou corretora)
    - Tesouro, CDB ou ações direto
    - Não sei
- Botão: **Calcular**
- Mensagens de erro:
  - Preencha todos os campos com números válidos.
  - A idade precisa estar entre 0 e 100 anos.
  - A idade para parar precisa ser maior que a idade atual.
  - O valor investido não pode ser negativo.
  - Informe a renda mensal que você quer manter na aposentadoria.
  - O aporte mensal não pode ser negativo.
  - Escolha onde o dinheiro está: fundos, direto ou não sei.

## 2. Resultado, um bloco por caso

Os dois quadros de idade e a frase "Para parar aos..." aparecem em todos os casos, menos "já atingiu".

**Normal** (exemplo do caso-base)
- Manchete: A tarifa custa {n} ano(s) de trabalho. → *A tarifa custa 1 ano de trabalho.*
- Exemplos da manchete: caso-base, *A tarifa custa 1 ano de trabalho.* Com aporte de R$ 8.000 e R$ 800 mil, 42 anos: *A tarifa custa 2 anos de trabalho.* (aos 75 contra aos 73).
- Subtítulo: Mantendo o aporte de hoje, você chega a {alvo} (300 vezes a renda mensal) em idades diferentes. → *...chega a R$ 9.000.000 (300 vezes a renda mensal) em idades diferentes.*
- Quadros: {aos 66} "Com a tarifa de hoje" | {aos 65} "Com custo baixo"
- Leitura: Para parar aos {idade alvo}, você precisaria investir {R$} por mês com a tarifa de hoje, ou {R$} por mês com custo baixo. → *Para parar aos 60, você precisaria investir R$ 24.155 por mês com a tarifa de hoje, ou R$ 22.735 por mês com custo baixo.*

**Tarifa baixa** (diferença menor que 1 ano; ex.: dinheiro direto)
- Manchete: Sua tarifa já é baixa.
- Subtítulo: A sua conta depende de quanto você investe por mês. Alvo: {alvo} (300 vezes a renda mensal).
- Quadros e leitura iguais ao normal. Quando a idade não é atingida, o quadro diz "não atinge".

**Já atingiu** (investido maior ou igual ao alvo)
- Manchete: O que você tem já paga essa renda.
- Subtítulo: A pergunta agora é quanto a tarifa tira dela. Com a taxa de {x,xx}% a.a., são cerca de {R$} por ano. → *Com a taxa de 0,65% a.a., são cerca de R$ 65.000 por ano* (para R$ 10 mi em fundos).
- Sem quadros de idade e sem frase de aporte.

**Nunca** (não chega antes dos 100 anos)
- Manchete: Com esse aporte, a conta não chega lá antes dos 100 anos.
- Subtítulo: Alvo: {alvo} (300 vezes a renda mensal). Veja abaixo quanto precisaria investir por mês.
- Quadros: "não atinge" com a tarifa de hoje e com custo baixo. Frase de aporte necessário como no normal.

**Nota de "Não sei"** (aparece abaixo da leitura): Você marcou "não sei": contamos como fundos, o caso mais comum.

## 3. Como calculamos (caixa que abre)

Título: Como calculamos
- Alvo: 300 vezes a renda mensal, em dinheiro de hoje.
- Rendimento real antes das tarifas: 4,46% a.a. Fonte: BCB/SGS: CDI (4391) e IPCA (433), 2006–2025 (2026-11).
- Tarifa da sua opção: {0,65% se fundos ou "não sei"; 0,20% se direto}. Fonte, fundos: Dados abertos da CVM: mediana da taxa de administração paga pelo cotista típico de fundos de renda fixa e multimercado de varejo dos cinco maiores bancos (ponderada pelo número de cotistas; classes com taxa zero, ausente ou acima de 10% ficam de fora; previdência fora da medida: a CVM não publica a taxa) (2026-11). **[texto da fonte corrigido nesta versão]**
  Fonte, direto: Tesouro Direto: taxa de custódia da B3 (2026-11).
- Custo baixo: 0,20% a.a. Fonte: Tesouro Direto: taxa de custódia da B3 (2026-11).
- Texto fixo de cautela: Simulação, não promessa de retorno. A conta deixa de fora IR, INSS e aluguéis. Rendimento passado não garante o futuro.

## 4. Botões por modo

Dois botões no resultado: o do WhatsApp e "Gerar minha conta em PDF". O principal (cheio) muda por modo e caso.

**Fora do pico (modo do lançamento em dezembro)**
- WhatsApp: **Fale com a gente** (secundário). Texto pronto termina em "Quero conversar sobre isso."
- PDF: **Gerar minha conta em PDF** (principal, aparece primeiro).
- Caso tarifa baixa: igual (nada muda fora do pico).

**Pico (11 a 31/01/2027)**
- Casos normal, já atingiu e nunca: WhatsApp **Quero o número exato da minha carteira** (principal, primeiro); PDF vira secundário. Texto pronto termina em "Quero o Raio-X da minha carteira."
- Caso tarifa baixa: WhatsApp **Quer conferir mesmo assim?** (secundário); PDF principal. O texto pronto continua terminando em "Quero o Raio-X da minha carteira."

## 5. Mensagens prontas do WhatsApp

Geradas pelas funções reais com o caso-base. Pessoal (Hélio, 55 11 99208-6907) quando o investido é de R$ 500 mil ou mais; suporte (55 11 5192-3850) abaixo disso. Fora do pico leva `(calc)` no fim; no pico, `(calc rx)`.

**Pessoal, fora do pico** (R$ 800 mil)
```
Olá, Hélio! Fiz a conta da aposentadoria no site: tenho 42 anos, quero parar aos 60, R$ 800 mil investidos, quero R$ 30 mil/mês, invisto R$ 15 mil/mês, a maior parte em fundos ou previdência (banco ou corretora). Com a tarifa paro aos 66; com custo baixo, aos 65. Quero conversar sobre isso.
(calc)
```

**Pessoal, pico**
```
Olá, Hélio! Fiz a conta da aposentadoria no site: tenho 42 anos, quero parar aos 60, R$ 800 mil investidos, quero R$ 30 mil/mês, invisto R$ 15 mil/mês, a maior parte em fundos ou previdência (banco ou corretora). Com a tarifa paro aos 66; com custo baixo, aos 65. Quero o Raio-X da minha carteira.
(calc rx)
```

**Suporte, fora do pico** (mesmo caso com R$ 300 mil investidos)
```
Olá! Fiz a conta da aposentadoria no site: tenho 42 anos, quero parar aos 60, R$ 300 mil investidos, quero R$ 30 mil/mês, invisto R$ 15 mil/mês, a maior parte em fundos ou previdência (banco ou corretora). Com a tarifa paro aos 68; com custo baixo, aos 67. Quero conversar sobre isso.
(calc)
```

**Suporte, pico**
```
Olá! Fiz a conta da aposentadoria no site: tenho 42 anos, quero parar aos 60, R$ 300 mil investidos, quero R$ 30 mil/mês, invisto R$ 15 mil/mês, a maior parte em fundos ou previdência (banco ou corretora). Com a tarifa paro aos 68; com custo baixo, aos 67. Quero o Raio-X da minha carteira.
(calc rx)
```

Variações da frase do meio, iguais nos quatro textos:
- Já atingiu: "O que tenho já paga essa renda."
- Nunca: "Pela conta, não chego lá antes dos 100 anos."
- Tarifa baixa (dinheiro direto): "Com a tarifa paro aos 65; com custo baixo, aos 65."
- "Onde está": fundos = "fundos ou previdência (banco ou corretora)"; direto = "Tesouro, CDB ou ações direto"; não sei = "não sei (contamos como fundos)".

## 6. E-mail, colega, rodapé e aviso legal

**Bloco do e-mail (abaixo do resultado)**
- A conta em PDF libera com o e-mail da newsletter. O e-mail não leva os seus números.
- Título do formulário: Receber a minha conta em PDF
- Aviso de consentimento: Ao se inscrever, você autoriza receber neste e-mail a sua conta e a carta sobre dinheiro para médico. Pode cancelar quando quiser.
- Quem já assina: Já recebe a newsletter? **Sua conta está aqui.**

**Mande a um colega** (link; abre o WhatsApp com este texto)
- Link: Mande a um colega
- Mensagem: Fiz uma conta sobre quanto a tarifa dos fundos atrasa a aposentadoria. Leva um minuto: https://estudos.drheliobarros.com.br/aposentadoria/

**Aviso legal (rodapé)**
- **Aviso importante.** Esta calculadora tem caráter exclusivamente informativo e educacional e não constitui recomendação de investimento, nos termos da regulamentação da Comissão de Valores Mobiliários. O resultado é uma simulação com premissas declaradas e não representa a situação de nenhum investidor específico.
- **Doctor Invest** · Gestão de investimentos e consultoria financeira para médicos · Hélio Cardoso de Barros, CGA.

## 7. Resposta automática no WhatsApp de suporte (outro repositório, só para aprovação)

Origem: `src/sofia/calc/autoresposta.ts`. Uma resposta por telefone, uma única vez, só entre 8h e 20h (Brasília), só para celular brasileiro, só para mensagem que traz a frase "fiz a conta da aposentadoria no site" e termina em `(calc)` ou `(calc rx)`. Só liga depois do seu ok (`CALC_AUTORESPOSTA_ENABLED`).

**`TEXTO_RX`** (vai quando a mensagem termina em `(calc rx)`, ou seja, no pico, quando o lead pede o Raio-X):
> Oi! Aqui é a equipe do Dr. Hélio Barros. Recebemos a sua conta da aposentadoria. Para o Raio-X da Tarifa Invisível, manda aqui o print da tela de investimentos do seu banco ou corretora, ou o extrato em PDF. Em até 72 horas você recebe quanto paga por ano em taxa, em reais.

**`TEXTO_RECEBIDO`** (vai quando a mensagem termina em `(calc)`, ou seja, fora do pico, lead que quer conversar):
> Oi! Aqui é a equipe do Dr. Hélio Barros. Recebemos a sua conta da aposentadoria. Alguém da equipe te responde por aqui em breve.

## Pontos para sua decisão

- No pico, caso tarifa baixa: o botão fica secundário ("Quer conferir mesmo assim?"), mas a mensagem pronta ainda pede o Raio-X. Está coerente com o botão, mas confirme.
- A diferença em patrimônio aos 60 (R$ 331 mil no caso-base) não está na página; só aqui.

## Guard CVM: justificativa dos sinais

O guard acusa 17 ocorrências de quatro percentuais: 4,46% (rendimento real), 0,65% e 0,20% (tarifas) e 10% (limite da medição). Ele casa os dígitos antes do "%", por isso a lista mostra "46%" e "65%" em vez de "4,46%" e "0,65%". Falso positivo: são premissas medidas e declaradas com fonte e data, usadas como entrada da simulação, não projeção de rentabilidade de produto. A página diz "Simulação, não promessa de retorno" e o rodapé repete o caráter informativo. Nenhum trecho cita produto, banco, corretora ou retorno futuro prometido. Se quiser menos exposição, a sugestão é manter o 4,46% só dentro de "Como calculamos" (já é assim).

Saída bruta do guard (rodado sobre este arquivo antes desta linha): `{"cvm_flags": ["46%", "65%", "10%", "20%", "20%", "65%", "46%", "65%", "20%", "10%", "46%", "20%", "46%", "65%", "20%", "10%", "46%"]}`
