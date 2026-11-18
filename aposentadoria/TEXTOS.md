# Calculadora da aposentadoria: textos aprovados

> **Aprovado pelo Hélio em 18/11/2026**, com os dois textos da resposta automática (seção 7). Mudar uma palavra pede nova aprovação.

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
- Idade em que atinge: **66 anos e 2 meses com a tarifa** e **65 anos com custo baixo**. Diferença na página: **1 ano e 2 meses** (14 meses, contados dos meses exatos).
- Aporte mensal necessário para parar aos 60: **R$ 24.155 com a tarifa** e **R$ 22.735 com custo baixo** (diferença R$ 1.420/mês).
- Patrimônio aos 60 anos mantendo o aporte de hoje: R$ 6.183.348 com a tarifa; R$ 6.514.692 com custo baixo. **Diferença: R$ 331.345** (mesma fórmula mensal; nenhum dos dois chega aos R$ 9 mi aos 60).
- Custo anual da tarifa sobre o investido hoje: R$ 5.200.

**A premissa que decide o número: a tarifa dos fundos.** A CVM publica três medidas possíveis para a mesma amostra (197 classes de fundos de renda fixa e multimercado de varejo dos cinco maiores bancos, com taxa de administração em lâmina). A página usa a do meio. Caso-base (42/60/R$ 800 mil/R$ 30 mil/R$ 15 mil/fundos), custo baixo 0,20% em todas:

| Medida da tarifa dos fundos | Taxa | Atraso no caso-base | Aporte mensal necessário (tarifa × custo baixo) | Patrimônio aos 60 a menos que com custo baixo |
|---|---|---|---|---|
| Mediana simples das classes | 0,50% | 9 meses (65 anos e 9 meses × 65 anos) | R$ 23.677 × R$ 22.735 | R$ 223.070 |
| Ponderada pelo número de cotistas (**escolhida pelo Hélio em 18/11**, o cotista típico) | 0,65% | 1 ano e 2 meses (66 anos e 2 meses × 65 anos) | R$ 24.155 × R$ 22.735 | R$ 331.345 |
| Ponderada pelo patrimônio líquido | 0,25% | 1 mês (65 anos e 1 mês × 65 anos) | R$ 22.891 × R$ 22.735 | R$ 37.793 |

A ponderação por patrimônio dá peso às classes institucionais grandes, que cobram pouco; a por cotistas é a do médico de varejo. Quanto menor a taxa escolhida, menos a página tem a mostrar. Decida qual vale como premissa pública.

**O que ficou de fora da medida:** das 348 classes com lâmina nos últimos 12 meses, 151 (43%) foram descartadas por taxa zero, ausente ou acima de 10%. Se boa parte delas é de taxa zero de verdade, a mediana medida fica para cima do que o cotista paga.

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
- Manchete: A tarifa custa {anos e meses} de trabalho, a diferença exata entre as duas idades, em meses. → *A tarifa custa 1 ano e 2 meses de trabalho.*
- Outros formatos: *1 ano e 1 mês*, *8 meses*, *3 anos*. Com aporte de R$ 8.000 e R$ 800 mil, 42 anos: *A tarifa custa 2 anos de trabalho.* (aos 75 anos e 1 mês contra aos 73 anos e 1 mês).
- Se a diferença é de menos de 1 mês: *Com esse aporte, a tarifa quase não muda a data.*
- Quem tem fundos fica neste caso mesmo quando a diferença é pequena.
- Subtítulo: Mantendo o aporte de hoje, você chega a {alvo} (300 vezes a renda mensal) em idades diferentes. → *...chega a R$ 9.000.000 (300 vezes a renda mensal) em idades diferentes.*
- Quadros (idade em anos e meses, a mesma da manchete): {aos 66 anos e 2 meses} "Com a tarifa de hoje" | {aos 65 anos} "Com custo baixo (só a custódia, 0,20% a.a.)"
- Leitura: Para parar aos {idade alvo}, você precisaria investir {R$} por mês com a tarifa de hoje, ou {R$} por mês com custo baixo. → *Para parar aos 60, você precisaria investir R$ 24.155 por mês com a tarifa de hoje, ou R$ 22.735 por mês com custo baixo.*

**Tarifa baixa** (decidida pela taxa, não pela diferença: só quando a opção marcada é "direto", com taxa igual à do custo baixo)
- Manchete: Sua tarifa já é baixa.
- Subtítulo: A sua conta depende de quanto você investe por mês. Alvo: {alvo} (300 vezes a renda mensal).
- Como as duas linhas são iguais, a página mostra um quadro só ({aos 65 anos} "Com a tarifa de hoje") e a leitura sem comparação: Para parar aos {idade alvo}, você precisaria investir {R$} por mês. Quando a idade não é atingida, o quadro diz "não atinge".

**Já atingiu** (investido maior ou igual ao alvo)
- Manchete: O que você tem já paga essa renda.
- Subtítulo: A pergunta agora é quanto a tarifa tira dela. Com a taxa de {x,xx}% a.a., são cerca de {R$} por ano. → *Com a taxa de 0,65% a.a., são cerca de R$ 65.000 por ano* (para R$ 10 mi em fundos).
- Sem quadros de idade e sem frase de aporte.

**Nunca** (não chega antes dos 100 anos)
- Manchete: Com esse aporte, a conta não chega lá antes dos 100 anos.
- Subtítulo: Alvo: {alvo} (300 vezes a renda mensal). Veja abaixo quanto precisaria investir por mês.
- Quadros: "não atinge" com a tarifa de hoje e com custo baixo. Frase de aporte necessário como no normal.
- Se só a linha da tarifa não chega aos 100 anos (o custo baixo chega), a manchete é: Com a tarifa de hoje, a conta não chega lá antes dos 100 anos.

**Nota de "Não sei"** (aparece abaixo da leitura): Você marcou "não sei": contamos como fundos, o caso mais comum.

**Cautela** (sempre visível, logo abaixo do resultado, e no PDF): Simulação, não promessa de retorno. A conta deixa de fora IR, INSS e aluguéis. Rendimento passado não garante o futuro.

**PDF (Gerar minha conta em PDF)**: abre com o bloco "**Os números que você informou.**" e a frase "tenho {idade} anos, quero parar aos {idade alvo}, {R$} investidos, quero {R$}/mês, invisto {R$}/mês, a maior parte em {onde}." (a mesma do WhatsApp). "Como calculamos" sai aberto.

## 3. Como calculamos (caixa que abre)

Título: Como calculamos
- Alvo: 300 vezes a renda mensal, em dinheiro de hoje.
- Rendimento real antes das tarifas: 4,46% a.a. Fonte: BCB/SGS: CDI (4391) e IPCA (433), 2006–2025 (2026-11).
- Tarifa da sua opção: {0,65% se fundos ou "não sei"; 0,20% se direto}. Fonte, fundos: Dados abertos da CVM: mediana da taxa de administração paga pelo cotista típico de fundos de renda fixa e multimercado de varejo dos cinco maiores bancos (ponderada pelo número de cotistas; classes com taxa zero, ausente ou acima de 10% ficam de fora; previdência fora da medida: a CVM não publica a taxa) (2026-11).
  Fonte, direto: Tesouro Direto: taxa de custódia da B3 (2026-11).
- Custo baixo: 0,20% a.a. Fonte: Tesouro Direto: taxa de custódia da B3 (2026-11). Nos quadros, o rótulo é "Com custo baixo (só a custódia, 0,20% a.a.)".
- A cautela fixa (acima) fica fora desta caixa, sempre visível.

## 4. Botões por modo

Dois botões no resultado: o do WhatsApp e "Gerar minha conta em PDF". O principal (cheio) muda por modo e caso.

**Fora do pico (modo do lançamento em dezembro)**
- WhatsApp: **Fale com a gente** (secundário). Texto pronto termina em "Quero conversar sobre isso."
- PDF: **Gerar minha conta em PDF** (principal, aparece primeiro).
- Caso tarifa baixa: igual (nada muda fora do pico).

**Quem volta do e-mail (página "Seu estudo está pronto")**: os números voltam preenchidos e o resultado reaparece sozinho.

**Pico (11 a 31/01/2027)**
- Casos normal, já atingiu e nunca: WhatsApp **Quero o número exato da minha carteira** (principal, primeiro); PDF vira secundário. Texto pronto termina em "Quero o Raio-X da minha carteira."
- Caso tarifa baixa: WhatsApp **Quer conferir mesmo assim?** (secundário); PDF principal. O texto pronto continua terminando em "Quero o Raio-X da minha carteira."

## 5. Mensagens prontas do WhatsApp

Geradas pelas funções reais com o caso-base. Pessoal (Hélio, 55 11 99208-6907) quando o investido é de R$ 500 mil ou mais; suporte (55 11 5192-3850) abaixo disso. Fora do pico leva `(calc)` no fim; no pico, `(calc rx)`.

**Pessoal, fora do pico** (R$ 800 mil)
```
Olá, Hélio! Fiz a conta da aposentadoria no site: tenho 42 anos, quero parar aos 60, R$ 800 mil investidos, quero R$ 30 mil/mês, invisto R$ 15 mil/mês, a maior parte em fundos ou previdência (banco ou corretora). Com a tarifa paro aos 66 anos e 2 meses; com custo baixo, aos 65 anos. Quero conversar sobre isso.
(calc)
```

**Pessoal, pico**
```
Olá, Hélio! Fiz a conta da aposentadoria no site: tenho 42 anos, quero parar aos 60, R$ 800 mil investidos, quero R$ 30 mil/mês, invisto R$ 15 mil/mês, a maior parte em fundos ou previdência (banco ou corretora). Com a tarifa paro aos 66 anos e 2 meses; com custo baixo, aos 65 anos. Quero o Raio-X da minha carteira.
(calc rx)
```

**Suporte, fora do pico** (mesmo caso com R$ 300 mil investidos)
```
Olá! Fiz a conta da aposentadoria no site: tenho 42 anos, quero parar aos 60, R$ 300 mil investidos, quero R$ 30 mil/mês, invisto R$ 15 mil/mês, a maior parte em fundos ou previdência (banco ou corretora). Com a tarifa paro aos 68 anos e 8 meses; com custo baixo, aos 67 anos e 6 meses. Quero conversar sobre isso.
(calc)
```

**Suporte, pico**
```
Olá! Fiz a conta da aposentadoria no site: tenho 42 anos, quero parar aos 60, R$ 300 mil investidos, quero R$ 30 mil/mês, invisto R$ 15 mil/mês, a maior parte em fundos ou previdência (banco ou corretora). Com a tarifa paro aos 68 anos e 8 meses; com custo baixo, aos 67 anos e 6 meses. Quero o Raio-X da minha carteira.
(calc rx)
```

Variações da frase do meio, iguais nos quatro textos:
- Já atingiu: "O que tenho já paga essa renda."
- Nunca: "Pela conta, não chego lá antes dos 100 anos."
- Tarifa baixa (dinheiro direto): "Pela conta, paro aos 65 anos."
- "Onde está": fundos = "fundos ou previdência (banco ou corretora)"; direto = "Tesouro, CDB ou ações direto"; não sei = "fundos ou previdência (não sei ao certo)".

## 6. E-mail, colega, rodapé e aviso legal

**Bloco do e-mail (abaixo do resultado)**
- A conta em PDF libera com o e-mail da newsletter. O e-mail não leva os seus números.
- Título do formulário: Receber a minha conta em PDF
- Aviso de consentimento: Ao se inscrever, você autoriza receber a carta sobre dinheiro para médico e libera o PDF da conta que está nesta tela. Nenhum número seu vai por e-mail. Pode cancelar quando quiser.
- Quem já assina: Já recebe a newsletter? **Sua conta está aqui.**

**Mande a um colega** (link; abre o WhatsApp com este texto)
- Link: Mande a um colega
- Mensagem: Fiz uma conta sobre quanto a tarifa dos fundos atrasa a aposentadoria. Leva um minuto: https://estudos.drheliobarros.com.br/aposentadoria/?utm_source=colega

**Aviso legal (rodapé)**
- **Aviso importante.** Esta calculadora tem caráter exclusivamente informativo e educacional e não constitui recomendação de investimento, nos termos da regulamentação da Comissão de Valores Mobiliários. O resultado é uma simulação com premissas declaradas e não representa a situação de nenhum investidor específico.
- **Doctor Invest** · Gestão de investimentos e consultoria financeira para médicos · Hélio Cardoso de Barros, CGA.

## 6b. Página "Seu estudo está pronto" para a calculadora (`obrigado.html?e=aposentadoria`)

Aparece depois do e-mail (ou do "Sua conta está aqui"). Não há PDF nem CSV para baixar.
- Etiqueta: Doctor Invest · Estudo
- Título: **Está pronto.**
- Texto: Calculadora de aposentadoria. Volte à calculadora para gerar o PDF da sua conta.
- Link: ← Voltar ao simulador (com os números guardados: ← Voltar e gerar o PDF da sua simulação (seus números ficaram))
- Rodapé: Doctor Invest · Hélio Cardoso de Barros, CEO e especialista de investimentos CGA. Material com finalidade exclusivamente educacional e informativa. Não constitui recomendação, oferta ou solicitação de compra ou venda de qualquer ativo, nem consultoria ou análise de valores mobiliários nos termos da regulamentação da CVM.
- A página ainda traz o aviso "Confirme o e-mail para receber as próximas", mas ele está escondido (a dupla confirmação está desligada).

## 7. Resposta automática no WhatsApp de suporte (outro repositório, só para aprovação)

Origem: `src/sofia/calc/autoresposta.ts`. Uma resposta por telefone, uma única vez, só entre 8h e 20h (Brasília), só para celular brasileiro, só para mensagem que traz a frase "fiz a conta da aposentadoria no site" e termina em `(calc)` ou `(calc rx)`. Só liga depois do seu ok (`CALC_AUTORESPOSTA_ENABLED`).

**`TEXTO_RX`** (vai quando a mensagem termina em `(calc rx)`, ou seja, no pico, quando o lead pede o Raio-X):
> Oi! Aqui é a equipe do Dr. Hélio Barros. Recebemos a sua conta da aposentadoria. Para o Raio-X da Tarifa Invisível, manda aqui o print da tela de investimentos do seu banco ou corretora, ou o extrato em PDF. Em até 72 horas você recebe quanto paga por ano em taxa, em reais.

**`TEXTO_RECEBIDO`** (vai quando a mensagem termina em `(calc)`, ou seja, fora do pico, lead que quer conversar):
> Oi! Aqui é a equipe do Dr. Hélio Barros. Recebemos a sua conta da aposentadoria. Alguém da equipe te responde por aqui em breve.

## Pontos para sua decisão

- No pico, caso tarifa baixa: o botão fica secundário ("Quer conferir mesmo assim?"), mas a mensagem pronta ainda pede o Raio-X. Está coerente com o botão, mas confirme.
- A diferença em patrimônio aos 60 (R$ 331 mil no caso-base) não está na página; só aqui.
- ~~A medida da tarifa dos fundos~~ — decidido em 18/11: 0,65% (cotista típico).

## Guard CVM: justificativa dos sinais

O guard acusa 22 ocorrências de sete percentuais: 4,46% (rendimento real), 0,65%, 0,20%, 0,50% e 0,25% (tarifas), 10% (limite da medição) e 43% (parcela de classes descartadas). Ele casa os dígitos antes do "%", por isso a lista mostra "46%", "65%", "50%" e "25%" em vez de "4,46%", "0,65%", "0,50%" e "0,25%". Falso positivo: são premissas medidas e declaradas com fonte e data, usadas como entrada da simulação (e, no quadro de decisão acima, as três medidas da tarifa que só você lê), não projeção de rentabilidade de produto. A página diz "Simulação, não promessa de retorno" e o rodapé repete o caráter informativo. Nenhum trecho cita produto, banco, corretora ou retorno futuro prometido. O 0,50%, o 0,25% e o 43% só existem neste arquivo de decisão, não na página. Na página, o 4,46% fica só dentro de "Como calculamos".

Saída bruta do guard (rodado sobre este arquivo antes desta linha): `{"cvm_flags": ["46%", "65%", "10%", "20%", "20%", "20%", "50%", "65%", "25%", "43%", "10%", "20%", "65%", "46%", "65%", "20%", "10%", "20%", "20%", "50%", "65%", "25%"]}`

## Formulário de e-mail (beehiiv)
- Formulário próprio "Calculadora de aposentadoria — PDF da conta", mesmo visual dos estudos. Campo: "Seu melhor e-mail". Botão: **Receber minha conta**. Enviando: "Enviando". Mensagem de sucesso: "Pronto. Liberando o PDF da sua conta…" (a página redireciona para o obrigado).
