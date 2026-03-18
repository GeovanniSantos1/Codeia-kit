---
name: support-escalation
description: Triage support tickets, incidents, customer complaints, outages, billing mistakes, security or data-loss risks, legal threats, imprensa/redes sociais exposure, and VIP dissatisfaction. Use when Codex needs to classify a case as P0/P1/P2/P3, decide whether to escalate to engineering, leadership, or both, collect the right evidence, and draft the internal escalation plus the customer-facing next step.
---

# Support Escalation

## Triage Workflow
1. Ler `references/escalation-guide.md` antes de classificar o caso. Tratar esse arquivo como fonte de verdade para severidade, gatilhos e template.
2. Extrair os fatos minimos: cliente, problema exato, impacto, desde quando, quantos afetados, evidencias, IDs/logs/prints e o que ja foi tentado.
3. Classificar o caso em `P0`, `P1`, `P2` ou `P3`.
4. Definir o destino da escalacao:
   - `Engineering`: bug, outage, auth, pagamento, cobranca incorreta, perda de dados, suspeita de seguranca ou integracao critica fora do ar.
   - `Leadership`: ameaca legal, imprensa/redes sociais, cliente VIP ou grande conta, risco de crise de imagem.
   - `Both`: quando houver incidente tecnico com impacto reputacional, legal ou comercial relevante.
   - `Support only`: duvida de uso, configuracao, solicitacao de funcionalidade ou reclamacao isolada sem padrao.
5. Produzir a saida completa com justificativa, dados faltantes, acao imediata e proximo passo para o cliente.

## Escalation Rules
- Escalar imediatamente se houver qualquer sinal crivel de seguranca, perda de dados, indisponibilidade ampla ou cobranca incorreta.
- Nao esperar o caso ficar "completo" para escalar `P0` ou `P1`. Escalar com os fatos ja confirmados e marcar os campos desconhecidos explicitamente.
- Diferenciar fatos confirmados de inferencias. Nunca inventar impacto, quantidade de afetados ou causa raiz.
- Usar a severidade mais alta quando houver ambiguidade entre `P0` e `P1` envolvendo risco financeiro, dados de clientes ou exposicao publica.
- Manter `P2/P3` no suporte quando o caso puder ser resolvido com orientacao, configuracao ou registro de feedback.

## Required Output
Responder neste formato:

```md
Classificacao: P0 | P1 | P2 | P3
Destino: Engineering | Leadership | Both | Support only
Justificativa:
- ...

Impacto:
- ...

Dados faltantes:
- ...

Acao imediata:
- ...

Escalacao interna:
URGENCIA: [P0/P1/P2]
CLIENTE: [nome/ID]
PROBLEMA: [descricao objetiva em 1-2 frases]
IMPACTO: [quantos usuarios, qual funcionalidade]
EVIDENCIAS: [link para ticket, prints, IDs relevantes]
JA TENTOU: [o que foi feito ate agora no suporte]

Mensagem ao cliente:
...
```

## Output Notes
- Se o destino for `Support only`, omitir `Escalacao interna` a menos que o usuario peca explicitamente um handoff ou ticket interno.
- Se o caso for `P0`, deixar claro que a escalacao deve seguir canal imediato (`Slack`, segundo a referencia) e que o cliente precisa receber proximo passo e prazo esperado.
- Se o caso for `P1`, indicar que a escalacao deve ocorrer no mesmo dia.
- Se o caso for `P2/P3`, priorizar orientacao pratica, proxima acao do suporte e eventual coleta adicional de contexto.
- Usar portugues claro, objetivo e sem dramatizacao.

## Resource
- `references/escalation-guide.md`: matriz de severidade, criterios de destino, checklist de contexto e template de escalacao interna.
