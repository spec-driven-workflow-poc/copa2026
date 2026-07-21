# Copa do Mundo 2026 — Acompanhamento

Página simples (HTML/CSS/JS puro, sem build) para acompanhar os jogos da Copa de 2026.

## Como usar

Abra o `index.html` no navegador (duplo clique). Não precisa instalar nada nem rodar servidor.

> O navegador precisa de internet para buscar os resultados e as bandeiras.
> Funciona em Chrome/Edge/Firefox abrindo direto do arquivo (`file://`).

## O que faz

- **Fase de grupos / Fase eliminatória**: por padrão mostra os grupos enquanto eles estão
  ativos e passa automaticamente para o mata-mata quando o último jogo de grupo é finalizado.
  Use as abas no topo para alternar a qualquer momento.
- **Tabelas dos 12 grupos** com PTS, J, V, E, D, GP, GC, SG. Passe o mouse no ícone **ⓘ**
  de cada coluna para ver a explicação. Classificados (1º/2º) e o 3º colocado ficam destacados.
- **Resultados automáticos**: a cada recarregamento (reload) a página consulta a API
  (openfootball) e recalcula tudo. Há também o botão **↻ Atualizar**.
- **Edição manual**: dá para digitar/alterar qualquer placar (e pênaltis no mata-mata) para
  simular ou corrigir. Jogos editados ficam **marcados em laranja**, salvos no navegador e
  **nunca são sobrescritos** pela API. Use **↺ reverter** para voltar ao valor automático.
- **Próximos jogos** em destaque no topo, com dia e horário em **GMT-3 (Brasília)**.
- **Chaveamento clássico** do mata-mata com as linhas convergindo, preenchido conforme os
  resultados saem (incluindo os 8 melhores terceiros colocados*).

\* A posição exata de cada melhor 3º colocado no chaveamento é uma **estimativa** (marcada com `≈`):
a tabela oficial da FIFA pode alocar os mesmos times em posições diferentes.

## Arquivos

| Arquivo        | Função                                                |
| -------------- | ----------------------------------------------------- |
| `index.html`   | Estrutura da página                                   |
| `styles.css`   | Visual, tooltips, tabelas e o chaveamento             |
| `countries.js` | Nomes dos 48 países em português + código da bandeira |
| `app.js`       | Busca na API, classificação, fuso, edição e mata-mata |

## Fonte de dados

[openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) — JSON público,
sem chave de API. Os resultados são atualizados pela comunidade por commits, então podem ter
algum atraso em relação ao tempo real. Bandeiras: [flagcdn.com](https://flagcdn.com).
