# Plataforma Integrada de Segurança Pública

Sistema web de segurança pública com mapa em tempo real, despacho inteligente de viaturas via IA, banco de dados de ocorrências e canal de denúncia cidadã.

## Stack

- React 19 + TypeScript + Vite
- Google Maps Platform (Maps JavaScript API)
- OSRM (Open Source Routing Machine) para roteamento real gratuito
- JSON Server como backend REST simulado
- Framer Motion para animações
- Recharts para gráficos no painel do prefeito

## Pré-requisitos

- Node.js 18+
- npm 9+
- Chave de API do Google Maps Platform com as seguintes APIs habilitadas no console:
  - Maps JavaScript API

## Configuração inicial

1. Clone o repositório:

```
git clone https://github.com/seu-usuario/public-security-system.git
cd public-security-system
```

2. Instale as dependências:

```
npm install
```

3. Configure as variáveis de ambiente. Copie o arquivo de exemplo e preencha com sua chave real:

```
copy .env.example .env
```

Abra o arquivo `.env` e substitua o placeholder pela sua chave do Google Maps:

```
VITE_MAPS_KEY=sua_chave_aqui
```

4. Inicie o servidor de desenvolvimento (sobe o frontend Vite e o banco de dados JSON Server simultaneamente):

```
npm run dev
```

O frontend estará disponível em `http://localhost:5174` e a API REST em `http://localhost:3001`.

## Estrutura do projeto

```
src/
  pages/
    Login/         - Tela de seleção de perfil
    Police/        - Dashboard operacional da polícia com mapa e despacho IA
    Citizen/       - App do cidadão para denúncias anônimas
    Mayor/         - Painel estratégico do prefeito com gráficos
    AI/            - Engine cognitivo com modelos preditivos e otimizador de despacho
db.json            - Banco de dados REST (incidents, partners, alerts, dispatches)
.env.example       - Modelo de variáveis de ambiente
```

## Perfis de acesso

Na tela inicial, selecione o perfil desejado:

- Policial: acesso ao mapa tático com viaturas, ocorrências e despacho via IA
- Cidadão: formulário de denúncia com foto/video e alertas em tempo real
- Prefeito: painel estratégico com métricas e gráficos históricos
- Sist. IA: engine cognitivo com modelos de ML, scores de risco e otimizador de despacho

## Funcionalidades principais

### Mapa Tático (Policial)

- Viaturas posicionadas em coordenadas reais de Cornélio Procópio, PR
- Clique em uma viatura para ver sua rota de patrulha
- Clique em uma ocorrência para abrir o painel de inteligência
- Botão Despacho IA: seleciona a viatura mais próxima via cálculo de distância geodésica (Haversine), traça a rota real pelas ruas via OSRM e anima o deslocamento em tempo real
- Barra de progresso mostra o percentual do trajeto concluído
- Botão Confirmar Chegada registra o despacho no banco de dados e envia notificação ao cidadão
- Marcadores roxos representam parceiros validadores (câmeras e vigilantes cadastrados)
- Marcadores verdes representam denúncias cidadãs recebidas

### Denúncia Cidadã

- Selecione o tipo de ocorrência e descreva o que está acontecendo
- Anexe foto ou video diretamente da câmera ou galeria
- Opção de envio anônimo (reduz score de confiança, mas preserva privacidade)
- Denúncia aparece no mapa da polícia em até 3 segundos
- Notificação push aparece na tela do cidadão quando a viatura confirma chegada ao local

### Banco de Dados

O arquivo `db.json` é servido pelo JSON Server na porta 3001 e expõe os endpoints:

- GET/POST /incidents - Ocorrências
- GET /partners - Parceiros validadores
- GET /alerts - Alertas de risco por zona
- POST /dispatches - Histórico de despachos confirmados

### Engine de IA

- Modulo Preditivo: forecasting de ocorrências por zona e horário
- Classificador NLP: categorização automática de denúncias em texto livre
- Detector de Anomalias: análise de padrões suspeitos em tempo real
- Motor de Risco: score de periculosidade por região
- Otimizador de Despacho: calcula qual viatura deve atender cada ocorrência com base em ETA real

## Variáveis de ambiente

| Variável | Descrição |
|---|---|
| VITE_MAPS_KEY | Chave da Google Maps JavaScript API |

## Observações

O arquivo `.env` está listado no `.gitignore` e nunca será enviado ao repositório. Nunca commite sua chave de API diretamente no código fonte.

O roteamento de viaturas utiliza a API pública do OSRM (router.project-osrm.org), que é gratuita e não requer autenticação. Em produção, recomenda-se hospedar uma instância própria do OSRM.

O JSON Server é uma solução de prototipagem. Em produção, substitua por uma API Node.js/Express ou Firebase com autenticação adequada.
