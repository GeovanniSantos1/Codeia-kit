---
name: customer-support
description: Draft customer-facing support replies for tickets, billing questions, product confusion, complaints, churn-risk conversations, crisis updates, and reusable response templates. Use when Codex needs to identify the real customer issue, decide whether the case should stay in support or be escalated, and write a clear, empathetic response that solves the problem while following company policy.
---

# Customer Support

## Workflow
1. Ler o ticket inteiro e resumir o problema real em uma frase. Se houver apenas sintomas, tratar a causa como hipotese e nao como fato.
2. Ler `references/response-templates.md` e escolher o template mais proximo do caso.
3. Ler `references/escalation-guide.md` antes de responder se houver risco operacional, financeiro, juridico, reputacional ou mais de um cliente afetado.
4. Separar fatos confirmados, pontos ainda em investigacao e o proximo passo concreto.
5. Redigir a resposta final no idioma do cliente, salvo instrucao explicita em contrario.

## Writing Rules
- Comecar com reconhecimento curto e especifico do problema.
- Responder diretamente o que o cliente perguntou antes de adicionar contexto extra.
- Usar linguagem simples e evitar jargao tecnico desnecessario.
- Assumir boa fe e nunca culpar o cliente.
- Explicar claramente o que foi feito, o que ainda sera verificado e quando havera novo retorno.
- Transformar pedidos de acao em instrucoes concretas e objetivas.
- Nao prometer causa raiz, prazo, reembolso ou correcao sem confirmacao interna.

## Escalation Rules
- Escalar antes de enviar se houver cobranca incorreta, perda de dados, suspeita de seguranca, indisponibilidade ampla, ameaca legal, exposicao publica ou risco comercial relevante.
- Carregar `../support-escalation/SKILL.md` quando precisar de classificacao formal (`P0` a `P3`) ou do handoff interno completo.
- Se a investigacao ainda estiver aberta, dizer isso ao cliente de forma objetiva e informar o proximo marco esperado.

## Required Output
Responder neste formato:

```md
Diagnostico:
- [problema real em 1-2 bullets]

Resposta ao cliente:
[mensagem pronta para envio]

Proximos passos internos:
- [acao do suporte, engenharia ou lideranca]
```

## Output Notes
- Se o cliente fizer varias perguntas, responder cada uma explicitamente.
- Em reclamacoes graves, reduzir tensao primeiro e discutir detalhes tecnicos depois.
- Em respostas de crise, manter o texto curto, factual e sem especulacao.
- Em templates recorrentes, substituir placeholders e remover qualquer instrucao interna antes de entregar.

## Resources
- `references/response-templates.md`: modelos base para investigacao, bug confirmado, cobranca, atraso e feature request.
- `references/escalation-guide.md`: sinais de escalacao e orientacao de comunicacao durante o handoff.
- `../support-escalation/SKILL.md`: skill complementar para severidade e escalacao interna formal.
