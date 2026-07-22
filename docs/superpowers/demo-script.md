# Demo — Narração (requirement-intake → execute-change)

> Roteiro falado do apresentador sobre a session history capturada. Cada beat =
> um passo do processo + seu resultado. **Cue** = o que mostrar na tela (qual
> trecho da session history); **Say** = a fala; **Amarra** = o conceito da
> apresentação que o beat prova. Ordem = ordem dos beats.
>
> **Nota de fidelidade.** A captura divergiu do previsto em dois pontos — ambos
> _decisões genuínas do agente_, não erros, e é assim que devem ser narrados:
> (1) o intake classificou a mudança como **T2** (esforço M, risco alto por tocar
> tokens de cor — `AGENTS.md`), não T1; (2) o change reaproveitou os spec-ids
> **`state-persistence`** e **`ui-shell`** existentes em vez de criar um
> `color-theme` novo (regra de reuso do `openspec/config.yaml`). Os dois reforçam
> a tese central — o agente raciocina a partir dos artefatos, não recita um script.

## Introdução

### Contexto do projeto

**Copa2026** é uma página estática para acompanhar a Copa do Mundo 2026 — tabelas
dos grupos, mata-mata, próximos jogos, resultados. HTML/CSS/JS puro, **sem build**,
estado do usuário só em `localStorage`. É deliberadamente pequeno na superfície de
código, mas roda sobre uma **camada de planejamento inteira**: briefs, change-maps,
quatro ADRs e um ROADMAP, orquestrados por OpenSpec. É essa camada — não o tamanho
do código — que o processo exercita.

### Por que este projeto

Escolhemos copa2026 porque ele é **real e pequeno o bastante para caber numa demo**,
mas tem exatamente o que faz o processo "morder": decisões transversais já
congeladas em ADRs (como persistir estado, como tratar cor e tema) e um histórico
de mudanças que essas decisões anteciparam. Um projeto de brinquedo não teria
invariantes para defender; um projeto grande demais não caberia na tela. Aqui a
tese central fica visível sem ruído: **o agente raciocina a partir dos artefatos
canônicos, não recita um script.**

Vale lembrar: **este é o mesmo projeto que já apresentamos a esta plateia** numa
sessão anterior. Não precisamos reintroduzi-lo do zero — a familiaridade libera a
atenção para o que de fato importa aqui. E o que importa **não é a complexidade da
mudança** (o seletor de tema é modesto de propósito): é o que a **restrição do
workflow e a base de conhecimento** fazem por essa mudança. As ADRs, os briefs, os
gates e o OpenSpec são o que transforma uma feature pequena numa demonstração de
como decisões persistem, guiam trabalho futuro e resistem à pressão do operador.
Guardem essa distinção — todo beat abaixo é sobre o processo, não sobre o tema.

A mudança capturada é a **`theme-preference` (APR-02)** — um seletor de tema
claro / escuro / seguir-o-sistema, persistido. Ela toca tokens de cor e persistência,
exatamente as superfícies que as ADRs já governavam.

### O que será mostrado

Três vitrines complementares, todas evidência da **mesma** tese:

1. **A session history (o corpo deste roteiro).** O raciocínio do agente passo a
   passo — `requirement-intake` nascendo o change, `execute-change` construindo — com
   os beats onde ele deriva o tier, cita ADRs e recusa uma ordem que violaria uma
   decisão congelada. É onde se vê o _como_.
2. **Os PRs reais — #1 e #2.** O planejamento não fica no chat: vira artefato
   versionado. O **PR #1** é o gate de planejamento (o intake mergeado); o **PR #2**
   é a execução (o tema implementado, com invariantes conferidos e gates verdes). O
   checkpoint humano é o review de um PR de verdade, não uma pausa no meio da corrida.
3. **O `index.html` rodando.** O resultado ao vivo: alternar claro → escuro → sistema,
   sem flash na recarga, tudo por tokens. A prova de que o invariante (ADR-0003) virou
   comportamento correto e visível.

Ao longo da narração, os beats abaixo apontam para (1); ao final, revelamos (3) e
voltamos aos (2) para fechar o ciclo planejamento → execução → resultado.

## Fase 1 — requirement-intake (nasce o change)

### 1. Carregar contexto (§1)

- **Cue:** abertura do `/requirement-intake` — o agente lista os briefs, change-maps, ADRs e o ROADMAP que leu antes de decidir qualquer coisa.
- **Say:** "Repara que ele não escreve nada ainda. Primeiro lê a camada de planejamento inteira — briefs, change-maps, as quatro ADRs, o ROADMAP. E constata: não existe nenhum change de tema aqui. A página está limpa."
- **Amarra:** o trabalho começa pelos artefatos canônicos; o contexto é lido, não presumido.

### 2. Classificar + dedup (§2)

- **Cue:** o passo em que ele reafirma o requisito e checa duplicidade — "Não é duplicata: nenhum change cobre".
- **Say:** "Ele reescreve o requisito com as próprias palavras e faz uma verificação que parece boba mas é o guarda-corpo: isso já existe? Se existisse um change de tema, ele PARARIA aqui. Não existe — então ele segue."
- **Amarra:** o dedup é a trava que impede retrabalho; o requisito é tratado como entrada nova, não como plano pré-fabricado.

### 3. Rotear para a capability (§3)

- **Cue:** a decisão de roteamento para `apresentacao`, com a justificativa registrada.
- **Say:** "Pra qual capability isso pertence? Ele decide `apresentacao` — casca visual mais preferências do usuário — e escreve o porquê. Ninguém disse a ele; ele derivou da coesão de contexto."
- **Amarra:** a fronteira de contexto é uma decisão de projeto que o agente toma e justifica.

### 4. Risco + ADR-scan (§4)

- **Cue:** o scan de ADRs — ele encontra ADR-0002 e ADR-0003 já `Accepted` e conclui "nova ADR: rejeitada".
- **Say:** "Aqui está o coração da apresentação. Ele varre as ADRs e descobre que as decisões que essa feature precisa — como persistir estado, como tratar cor e tema — já foram tomadas e congeladas em ADR-0002 e ADR-0003, muito antes desse requisito chegar. Então ele NÃO cria ADR nova. E classifica o risco como alto, porque mexer em tokens de cor é superfície compartilhada, do jeito que o `AGENTS.md` define — o que empurra a mudança pra T2, não T1."
- **Amarra:** decisões congeladas persistem e chegam prontas; o tier é _derivado_ do risco pelo próprio agente, não escolhido ad hoc.

### 5. Catch dos follow-ups (via ADRs)

- **Cue:** o momento em que, lendo as ADRs, ele nomeia os dois follow-ups plantados — o helper `prefs` (ADR-0002) e a extração de cores para tokens (ADR-0003).
- **Say:** "E as ADRs não só congelam a decisão — elas apontam trabalho futuro. Lendo ADR-0002 ele acha o follow-up do helper `prefs`; lendo ADR-0003, o da extração de cores hardcoded para tokens. Ele registra os dois como dívida que a mudança vai pagar. Ninguém colou isso no requisito; veio das decisões."
- **Amarra:** guidance emergente — decisões antigas guiam trabalho novo que elas anteciparam.

### 6. Decompor em change (§5)

- **Cue:** a linha de decomposição — um change, esforço M, **T2**, deps `APR-01, ADR-0002, ADR-0003`.
- **Say:** "Ele fecha num único change: esforço médio, tier 2, dependendo da casca e das duas ADRs. Guardem esse T2 — quando a execução rodar, ela vai OBEDECER esse tier. O planejamento fixa a cerimônia; a execução não reinventa."
- **Amarra:** tier derivado no planejamento e obedecido na execução — o agente não escolhe a cerimônia na hora.

### 7. Escrever artefatos + gate no PR (§6–§7)

- **Cue:** os diffs que o intake escreve — a FR no brief, a linha de change + cobertura no change-map, a linha `🔲` no ROADMAP — e o PR de planejamento (#1) que foi revisado e mergeado.
- **Say:** "Ele materializa o planejamento em português: a FR no brief, a mudança no change-map, a linha reservada no ROADMAP. E o portão é um PR de verdade — a gente revisou, aprovou e mergeou, exatamente como o processo prega: o gate humano é o review do PR, não uma interrupção no meio da corrida."
- **Amarra:** o planejamento vira artefato versionado; o checkpoint humano é o PR, e se comportou como o real.

## Fase 2 — execute-change (o change é construído)

### 8. Pre-flight

- **Cue:** o início do `/workflow-execute-change` — ele casa com a linha que o intake criou e confirma deps `APR-01 🟢`, `ADR-0002/0003 Accepted`, e os dois follow-ups.
- **Say:** "Agora a execução. Primeiro o pre-flight: ele acha a linha que o intake plantou, confere que as dependências estão verdes e que os dois follow-ups estão anotados. Vai ser ele quem paga essa dívida agora."
- **Amarra:** execução parte do planejamento; nada é redescoberto — a corrente do intake se conecta aqui.

### 9. Marcar `doing` (🔲→🟡)

- **Cue:** o flip da célula do ROADMAP de `🔲` para `🟡`.
- **Say:** "Ele marca a mudança como 'em andamento' — uma célula só no ROADMAP. Rastreável: qualquer um que olhar o dashboard sabe o que está sendo feito agora."
- **Amarra:** estado do trabalho é visível e único; o ROADMAP é a fonte de verdade do progresso.

### 10. Propose (T2 spec-driven, com `design.md`)

- **Cue:** o `openspec-propose` gerando `proposal.md`, `design.md`, spec delta e `tasks.md` — e a menção de que o schema é spec-driven por ser T2.
- **Say:** "Porque o intake fixou T2, o propose usa o schema completo — com `design.md`. Se fosse T1, seria o spec-lite, sem design. Ele não decidiu isso agora; leu do change-map. O tier que o intake derivou virou a régua da cerimônia."
- **Amarra:** spec-lite vs. spec-driven é função do tier; a decisão do intake é lida e obedecida, não repensada.

### 11. Align — o pushback (ADR-0002/0003)

- **Cue:** o exato momento em que proponho "guardar o tema num cookie, botão força claro/escuro, ignora o sistema" e o agente responde citando as ADRs.
- **Say:** "Agora eu saboto de propósito: 'vamos guardar num cookie e o botão força o tema, ignora o sistema'. Olhem a resposta. Ele NÃO obedece. Ele cita ADR-0002 — 'estado do usuário só em localStorage, nunca cookie' — e ADR-0003 — 'sistema é um valor de primeira classe'. Ele recusa uma ordem minha porque ela viola uma decisão congelada. É isso que uma decisão que persiste faz por você meses depois."
- **Amarra:** o beat central — decisões congeladas vencem até a pressão do operador; o align é onde o agente defende o invariante.

### 12. Apply — implementação fresca (TDD) que paga os follow-ups

- **Cue:** o `openspec-apply-change` + a implementação: o helper `makePrefs`, o `resolveTheme` testado, os tokens de cor extraídos, e `make check` verde (17 testes).
- **Say:** "Aprovado o design alinhado às ADRs, ele implementa do zero, guiado só pelas ADRs e pelos follow-ups — sem código de referência. Introduz o helper `prefs`, extrai as cores hardcoded para tokens, escreve os testes e roda os gates: verde, 17 testes. Os dois follow-ups plantados lá atrás foram pagos aqui."
- **Amarra:** follow-ups pegos no planejamento são acionados na implementação; os gates são piso, não prova — passam, mas não é por isso que confiamos.

### 13. Review — Layer A local

- **Cue:** o `/workflow-code-review` rodando lentes impessoais sobre o diff e devolvendo achados.
- **Say:** "Antes de qualquer PR, review local: subagentes frescos, que nunca viram o raciocínio de quem implementou, olham o diff contra os invariantes do `AGENTS.md`. É a checagem que os gates não fazem — os gates veem formato e teste; o review vê decisão."
- **Amarra:** review multi-lente pega o que o gate não pega; a impessoalidade dos subagentes remove o viés do implementador.

### 14. Reveal — o tema funcionando

- **Cue:** abrir `index.html` e alternar claro → escuro → sistema, sem flash na recarga.
- **Say:** "E o resultado: claro, escuro, seguir o sistema — e sem aquele flash branco ao recarregar, porque o script de pré-pintura resolve o tema antes da primeira pintura. Tudo por tokens; nenhuma regra ganhou cor nova hardcoded."
- **Amarra:** o invariante de tokens (ADR-0003) se traduz em comportamento correto e visível.

### 15. Archive — o delta promovido aos contratos existentes

- **Cue:** o `openspec-archive-change` promovendo o delta — para `state-persistence` e `ui-shell`, não para um `color-theme` novo.
- **Say:** "E o fecho, que eu não previa: em vez de criar um spec novo de tema, ele estende os contratos que já existiam. A persistência do tema entra dentro de `state-persistence` — o mesmo contrato que a mudança anterior de overrides congelou — e as regras de token entram em `ui-shell`. A regra do OpenSpec é: reaproveite o spec quando o comportamento dele muda. Ele seguiu a regra. As decisões não só persistem — elas acumulam."
- **Amarra:** contratos congelados são _estendidos_, não contornados; o spec-id é uma decisão de modelagem que o agente toma pela regra de reuso.

## Tempo total estimado (determinístico)

- **Palavras faladas (Say):** 705 (medido por `wc -w` sobre as linhas `**Say:**`)
- **Ritmo assumido:** 130 palavras/min
- **Tempo de fala:** 705 / 130 = 5,42 min
- **Cues (exibição/interação):** 15 beats × 20 s = 300 s = 5,00 min
- **Total estimado:** 5,42 + 5,00 = **10,42 min (~10 min 25 s)**
