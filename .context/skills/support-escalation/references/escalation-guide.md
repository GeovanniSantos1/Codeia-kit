# Escalation Guide

## Quando escalar imediatamente (P0)

### Para o time tecnico/engineering
- Sistema completamente fora do ar afetando todos os usuarios
- Brecha de seguranca ou suspeita de acesso indevido a dados
- Perda de dados de clientes
- Bug critico que causa cobranca incorreta

### Para gestao/lideranca
- Ameaca de acao legal
- Mencao a imprensa ou redes sociais com potencial viral negativo
- Cliente VIP ou grande conta expressando insatisfacao grave
- Situacao que pode virar crise de imagem

## Quando escalar no mesmo dia (P1)
- Bug confirmado que afeta um grupo de usuarios
- Integracao critica fora do ar (pagamento, autenticacao)
- Reclamacao repetida de multiplos clientes sobre o mesmo problema

## Quando resolver no suporte (P2/P3)
- Duvidas de uso da plataforma
- Solicitacoes de funcionalidade
- Problemas de configuracao resolviveis com instrucoes
- Reclamacoes pontuais sem padrao identificado

## Como escalar corretamente
1. Documentar o caso: cliente, problema exato, impacto, urgencia
2. Incluir contexto: desde quando, quantos afetados, evidencias (prints, logs, IDs)
3. Usar o canal correto: Slack para P0/P1 imediato, ticket para P2/P3
4. Informar o cliente que esta escalando e qual o proximo passo ou prazo esperado

## Template de escalacao interna
```text
URGENCIA: [P0/P1/P2]
CLIENTE: [nome/ID]
PROBLEMA: [descricao objetiva em 1-2 frases]
IMPACTO: [quantos usuarios, qual funcionalidade]
EVIDENCIAS: [link para ticket, prints, IDs relevantes]
JA TENTOU: [o que foi feito ate agora no suporte]
```
