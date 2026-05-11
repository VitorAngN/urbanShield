# UrbanShield — Plataforma Integrada de Segurança Pública

<p>
  <img src="https://img.shields.io/badge/Status-Concluído-success?style=flat-square" alt="Status" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Google_Maps_API-4285F4?style=flat-square&logo=google-maps&logoColor=white" alt="Google Maps" />
  <img src="https://img.shields.io/badge/OSRM-Roteamento_Real-green?style=flat-square" alt="OSRM" />
</p>

Dashboard interativo para monitoramento urbano em tempo real, com visualização de ocorrências em mapa, cálculo de proximidade entre unidades e despacho inteligente de viaturas.

---

## Funcionalidades

- **Mapa ao Vivo** com marcadores de ocorrências e localização de unidades via Google Maps API
- **Cálculo de Proximidade (Haversine)** para identificar a viatura mais próxima de uma ocorrência em tempo real
- **Roteamento Real de Viaturas** integrado com OSRM (Open Source Routing Machine) — rotas reais por ruas, não apenas linha reta
- **Despacho de Viaturas** com atualização de status em tempo real no mapa
- **Canal de Denúncia Cidadã** para registro de ocorrências com tipo, coordenadas e descrição

---

## Decisões Técnicas

### Por que Haversine?
O cálculo de qual unidade está mais próxima de uma ocorrência usa a fórmula de Haversine, que calcula a distância entre dois pontos em uma esfera (a Terra). Isso é mais preciso que uma distância euclidiana simples (que ignora a curvatura do planeta) e muito mais rápido do que fazer uma chamada de API de roteamento para cada par de unidades.

### Por que OSRM?
Para traçar a rota da viatura despachada, usamos o OSRM ao invés da Google Directions API. O OSRM é open-source, sem custo por requisição e pode ser auto-hospedado, o que é essencial para sistemas públicos com alto volume de dados.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, TypeScript, CSS Modules |
| Mapas | Google Maps JavaScript API |
| Roteamento | OSRM (Open Source Routing Machine) |
| Cálculo de Distância | Haversine (implementação própria) |

---

## Como Executar

Você precisa de uma **chave de API do Google Maps** (Google Cloud Console, com permissão para Maps JavaScript API).

```bash
# 1. Clonar o repositório
git clone https://github.com/VitorAngN/urbanShield.git
cd urbanShield

# 2. Instalar dependências
npm install

# 3. Configurar chave de API
# Crie um arquivo .env na raiz:
# REACT_APP_GOOGLE_MAPS_KEY=SUA_CHAVE_AQUI

# 4. Executar
npm start
```

Acesse em `http://localhost:3000`.

<img src="https://komarev.com/ghpvc/?username=VitorAngN-urbanShield" width="1" height="1" alt="" />
