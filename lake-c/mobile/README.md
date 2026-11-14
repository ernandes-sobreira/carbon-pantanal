# LAKE-C Campo: conexão local entre celulares

Esta pasta contém o projeto do aplicativo Android. O site público segue como caderno offline e backup JSON. A conexão ao vivo usa um plugin Capacitor comunitário para comunicação próxima entre Android/iOS; esta primeira entrega gera APK Android de depuração pelo GitHub Actions.

## Fluxo
1. Instale o APK nos celulares.
2. Cada aparelho abre o app pelo menos uma vez com internet para carregar o LAKE-C; o cadastro Firebase continua opcional para coletar. Para sincronizar diretamente com Firebase, cada operador precisa de uma conta autorizada pela coordenação.
3. Na coordenação, abra “Conexão de campo LAKE-C”, escolha Coordenação e ative.
4. No coletor, escolha Coletor e ative. Mantenha os dois apps abertos e os aparelhos próximos.
5. A coordenação confirma o celular que vai conectar. Cada réplica salva depois da conexão é transferida e gravada no aparelho receptor. Ao voltar internet, o aparelho coordenador tenta sincronizar a fila conforme sua conta e permissões Firestore.

A cópia recebida fica no IndexedDB do aparelho coordenador e aparece em Registros e análises. Use também o backup JSON como cópia de segurança. O receptor confirma via ACK depois de gravar no banco local.

## Limites desta versão
- Transferência só ocorre com app aberto e conexão Bluetooth/BLE ativa; ela não é um serviço garantido em segundo plano.
- Se a ligação cair, os dados ficam no aparelho do coletor e serão enviados após reconexão enquanto os dois apps estiverem abertos.
- A senha/conta Firebase do coordenador não deve ser compartilhada.
- A instalação Android é um APK de teste (debug), não publicado na Play Store. iPhone precisa de Xcode e assinatura Apple; esta automação não gera IPA.
- Plugin de terceiros: teste em campo com os modelos Android usados pela equipe antes de coleta oficial.
- O recebimento não autentica a identidade científica do aluno; a coordenação deve conferir o nome informado no aparelho e nos dados.

## Build Android
O workflow `.github/workflows/lakec-mobile-android.yml` produz o APK como artifact no GitHub Actions. O link de download aparece na execução do workflow, na seção Artifacts, por 30 dias.
