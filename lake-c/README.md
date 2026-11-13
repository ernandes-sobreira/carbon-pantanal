# LAKE-C — Caderno de campo

Aplicação web progressiva (PWA) para coleta científica da dinâmica do carbono em lagoas pantaneiras. Funciona em celulares, tablets e computadores com navegador moderno. Para usar em campo sem sinal, abra uma vez com internet e instale ou salve o atalho no aparelho.

## Dados e sincronização

- Registros não enviados ficam temporariamente em uma fila local do navegador para permitir coleta sem internet.
- Com internet e sessão autenticada, o app envia automaticamente os registros ao Firebase; remove a cópia da fila somente após confirmação de gravação pelo servidor.
- O app requer autenticação por e-mail/senha já cadastrada no projeto Firebase.
- A sincronização exige regras Firestore para `lakec_records` e `lakec_config`. A publicação das regras é uma mudança separada e não deve substituir nem reformatar regras existentes.
- O cache offline contém a interface; registros coletados não são guardados no cache da página.
- A localização pode ser obtida offline se o aparelho fornecer GPS e a permissão de localização estiver liberada. O app registra a acurácia reportada e o horário.

## Protocolo configurável

Compartimentos, variáveis, cores dos cards e itens de checklist podem ser configurados. O protocolo padrão traz variáveis limnológicas e atmosféricas; novos grupos e campos podem ser adicionados.

## Análise

Dados sincronizados podem ser baixados como CSV após autenticação para análise posterior. O CSV mantém identificadores de lagoa, ponto e réplica, variáveis, espécies/coberturas, checklist, fluxos e série bruta.
