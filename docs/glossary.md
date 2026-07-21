# Glossário — Copa2026

> Vocabulário de domínio para os specs do copa2026 (convenção de idioma em
> [workflow/README.md](workflow/README.md)). Termos de domínio mantidos verbatim.

| Termo                        | Definição                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Grupo**                    | Um dos 12 grupos da fase de grupos (A–L), com 4 seleções cada.                                               |
| **Classificação**            | Tabela ordenada de um grupo por PTS, SG, GP (regra em `app.js:sortRows`).                                    |
| **Terceiro colocado**        | 3º de cada grupo; os 8 melhores avançam ao mata-mata (posição no chaveamento é estimativa, marcada com `≈`). |
| **Mata-mata / Chaveamento**  | Fase eliminatória (R32→final) com o bracket de dois lados.                                                   |
| **Pênaltis**                 | Disputa que decide o vencedor em empate no mata-mata.                                                        |
| **Override (edição manual)** | Placar digitado pelo usuário; salvo em localStorage, nunca sobrescrito pela API (ADR-0004).                  |
| **Preferência de usuário**   | Estado do usuário persistido no cliente (ex.: tema); regido pela ADR-0002.                                   |
| **Tema**                     | Aparência visual `claro \| escuro \| sistema` (ADR-0003).                                                    |
| **Token de cor**             | Custom property CSS que carrega uma cor; base do tema (ADR-0003).                                            |

## Termos que colidem com o OpenSpec

**Regra — `capability`:** "capability" sem qualificação = o conceito do **copa2026**
(`docs/capabilities/<cap>/`: dados, classificacao, apresentacao). Para o conceito do
OpenSpec, escreva **"spec"/"spec-id"** (contrato de comportamento kebab-case). Um
copa2026 capability acumula vários spec-ids.
