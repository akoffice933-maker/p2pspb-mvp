# Production Deployment Guide

## Содержание

1. [Swagger/OpenAPI](#swaggeropenapi)
2. [E2E Тесты](#e2e-тесты)
3. [Kubernetes](#kubernetes)
4. [Prometheus + Grafana](#prometheus--grafana)
5. [Rate Limiting на Redis](#rate-limiting-на-redis)

---

## Swagger/OpenAPI

### Быстрый старт

```bash
cd services/api
npm install
npm run dev
```

Откройте: http://localhost:4000/api/docs

### Возможности

- Интерактивная документация всех endpoints
- Тестирование API прямо из браузера
- Автоматическая генерация из декораторов
- Persist authorization

### Примеры использования

```typescript
// Добавление декораторов в контроллер
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  @Get()
  @ApiOperation({ summary: 'Получить список заявок' })
  @ApiResponse({ status: 200, description: 'Успех' })
  async getOrders() {
    // ...
  }
}
```

---

## E2E Тесты

### Запуск тестов

```bash
# Unit тесты
npm run test

# E2E тесты
npm run test:e2e

# С покрытием
npm run test:cov
```

### Структура тестов

```
test/
├── jest-e2e.json       # E2E конфигурация
├── orders.e2e-spec.ts  # Тесты заказов
└── fraud.e2e-spec.ts   # Тесты анти-фрод
```

### Критические пути покрытия

1. **Создание заявки** - валидация, fraud checks
2. **Принятие заявки** - резервирование средств
3. **Подтверждение оплаты** - state machine переход
4. **Завершение сделки** - перевод средств
5. **Создание спора** - уведомления админам
6. **Anti-fraud** - velocity checks, multi-account

### Пример теста

```typescript
describe('/api/orders/create (POST)', () => {
  it('should create a new SELL order', () => {
    return request(app.getHttpServer())
      .post('/api/orders/create')
      .send({
        telegram_id: '123',
        type: 'SELL',
        rate: 92.5,
        amount: 1000,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.status).toBe('RESERVED');
      });
  });
});
```

---

## Kubernetes

### Структура манифестов

```
k8s/
├── namespace.yaml              # p2pspb namespace
├── configmap.yaml              # Конфигурация
├── secrets.yaml                # Секреты
├── postgres-statefulset.yaml   # PostgreSQL
├── postgres-service.yaml
├── api-deployment.yaml         # API (3 реплики)
├── api-service.yaml
├── web-deployment.yaml         # Frontend (2 реплики)
├── web-service.yaml
├── ingress.yaml                # Ingress с TLS
└── monitoring/
    ├── prometheus-*.yaml
    └── grafana-*.yaml
```

### Развёртывание

```bash
# Создать namespace
kubectl apply -f k8s/namespace.yaml

# Применить конфиги
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml

# Развернуть БД
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/postgres-service.yaml

# Развернуть API
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/api-service.yaml

# Развернуть Frontend
kubectl apply -f k8s/web-deployment.yaml
kubectl apply -f k8s/web-service.yaml

# Ingress
kubectl apply -f k8s/ingress.yaml

# Мониторинг
kubectl apply -f k8s/monitoring/
```

### Проверка статуса

```bash
kubectl get pods -n p2pspb
kubectl get services -n p2pspb
kubectl get ingress -n p2pspb
```

### Масштабирование

```bash
# API
kubectl scale deployment api --replicas=5 -n p2pspb

# Frontend
kubectl scale deployment web --replicas=3 -n p2pspb
```

### Логи

```bash
kubectl logs -f deployment/api -n p2pspb
kubectl logs -f deployment/web -n p2pspb
```

---

## Prometheus + Grafana

### Метрики

- **API**: запросы/сек, ошибки, latency
- **PostgreSQL**: подключения, queries/sec
- **Node**: CPU, memory, disk
- **Business**: сделки/час, споры/день, fraud alerts

### Endpoints

```
GET /api/health     # Health check
GET /api/ready      # Readiness probe
GET /metrics        # Prometheus metrics
```

### Доступ к Grafana

```bash
kubectl port-forward service/grafana 3000:3000 -n p2pspb
```

Логин: `admin`  
Пароль: `admin123`

### Доступ к Prometheus

```bash
kubectl port-forward service/prometheus 9090:9090 -n p2pspb
```

---

## Rate Limiting на Redis

### Конфигурация

```typescript
// app.module.ts
ThrottlerModule.forRootAsync({
  imports: [RedisModule],
  useFactory: (redisStorage: ThrottlerStorageRedisService) => ({
    storage: redisStorage,
    throttlers: [
      {
        ttl: 60000,  // 1 минута
        limit: 100,  // 100 запросов
      },
    ],
  }),
  inject: [ThrottlerStorageRedisService],
})
```

### Переменные окружения

```env
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your-password
```

### Docker Compose

```bash
docker-compose up -d redis
```

### Проверка

```bash
# Подключиться к Redis
redis-cli -h localhost -p 6379

# Посмотреть ключи rate limiting
KEYS throttle:*
```

---

## Checklist для Production

### Перед деплоем

- [ ] Все E2E тесты проходят
- [ ] Swagger документация актуальна
- [ ] Секреты обновлены в `k8s/secrets.yaml`
- [ ] Redis настроен и доступен
- [ ] Health checks работают

### После деплоя

- [ ] Pod'ы в статусе Running
- [ ] Ingress настроен с TLS
- [ ] Prometheus собирает метрики
- [ ] Grafana дашборды работают
- [ ] Rate limiting активен

### Мониторинг

- [ ] CPU < 70%
- [ ] Memory < 80%
- [ ] Error rate < 1%
- [ ] P95 latency < 500ms

---

## Troubleshooting

### API не запускается

```bash
kubectl describe pod <pod-name> -n p2pspb
kubectl logs <pod-name> -n p2pspb
```

### База данных не доступна

```bash
kubectl exec -it postgres-0 -n p2pspb -- psql -U p2pspb
```

### Redis не подключается

```bash
kubectl exec -it redis-<pod> -n p2pspb -- redis-cli ping
```

### Ingress не работает

```bash
kubectl describe ingress p2pspb-ingress -n p2pspb
```
