# Geolocalização, ETA e matching

O cliente pode consentir GPS ou preencher endereço manualmente. A localização inclui latitude, longitude, precisão e timestamp; geocodificação fica atrás de adapter futuro. Prestadores fornecem localização apenas ao escolher disponibilidade, sem captura contínua ou em background.

`MemoryGeoIndex` implementa `addProviderLocation`, `updateProviderLocation`, `removeProvider` e `findProvidersNearby` com Haversine. Campos `geoHash`, `geoCell` e `serviceAreaId` preparam PostGIS, Redis GEO, Geohash ou H3.

`StraightLineRoutingProvider` implementa distância, duração e rota com Haversine, fator viário e velocidade configuráveis. Poderá ser substituído por Google Maps Routes, Mapbox, HERE ou OpenRouteService sem chaves fictícias.

O score configurável considera distância (20), ETA (15), avaliação (15), conclusão (15), qualidade (10), agenda/disponibilidade (10), eficiência de rota (10) e experiência (5). A especialidade é requisito, nunca apenas um fator. Ao terminar uma OS, os mesmos dados permitem ordenar próxima oportunidade por `deadheadKm`, `deadheadMinutes` e eficiência de rota.

`calculateDemandHotspots()` agrega bairro, cidade, geoCell, hora e categoria de modo determinístico para demanda, oferta, não preenchimento e espera; não alega usar IA.
