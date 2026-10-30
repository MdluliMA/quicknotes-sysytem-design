# QuickNotes System Architecture

## 1. Purpose

QuickNotes is moving from a browser-only prototype to an online service designed for approximately one million registered users. The browser client will call an authenticated API, and the backend will persist notes and tags in a relational database.

## 2. Requirements

### Functional requirements

- Users can register and authenticate securely.
- Users can create, read, update, and delete their own notes.
- Users can create tags and attach tags to notes.
- Users can search, filter, and paginate notes.
- The API validates data and returns consistent errors.
- Notes persist across sessions and devices.

### Non-functional requirements

- **Availability:** Target 99.9% service availability, subject to operational planning.
- **Performance:** Aim for common read requests to complete within 300 ms at the 95th percentile under expected load.
- **Scalability:** Add application instances horizontally as traffic increases.
- **Security:** HTTPS, secure authentication, authorization checks, input validation, rate limiting, and managed secrets.
- **Durability:** Backups and tested restore procedures protect user data.
- **Observability:** Centralized logs, metrics, tracing, and alerts support diagnosis.
- **Maintainability:** Versioned API contracts and automated tests support safe changes.

## 3. Load Estimate for 1 Million Users

These are planning assumptions, not measured production traffic.

Assume:
- 1,000,000 registered users.
- 10% are active each day = 100,000 daily active users.
- Each active user makes 50 read requests and 5 write requests per day.
- Use 100,000 seconds as a simple approximation for a day when estimating average request rates; actual days have 86,400 seconds.
- Each stored note, including average text and row/index overhead, is estimated at 2 KB.
- Each daily active user creates 2 notes per day.

### Average read requests per second

100,000 users × 50 reads = 5,000,000 reads/day.

5,000,000 ÷ 86,400 ≈ **58 reads/second** (approximately 50 using the simplified 100,000-second estimate).

### Average write requests per second

100,000 users × 5 writes = 500,000 writes/day.

500,000 ÷ 86,400 ≈ **5.8 writes/second** (approximately 5 using the simplified estimate).

### Note storage per year

100,000 daily active users × 2 notes/day = 200,000 new notes/day.

200,000 × 365 = 73,000,000 notes/year.

73,000,000 × 2 KB ≈ **146 GB/year** of note data before replication, backups, and additional indexes. Actual storage depends on note size, retention, indexes, and metadata.

For capacity planning, test peak traffic as well as averages; a starting assumption might be 5 times average traffic during peaks. Cacheable reads can reduce database load.

## 4. Architecture Diagram

```text
                 Users / Browser / Mobile Client
                              |
                             DNS
                              |
                             CDN
                   (static HTML, CSS, JS)
                              |
                        Load Balancer
                         /          \
                 App Server 1     App Server 2
                         \          /
                         Application API
                          /         \
                    Cache (e.g. Redis)
                          |
                 Primary SQL Database
                          |
                     Read Replica


Application API --> Queue --> Background Worker
                                  |
                          Email / notifications /
                          exports / async tasks
```

The diagram is logical: the API can route writes to the primary database and suitable reads to the replica. Production deployment should spread redundant instances across failure zones and protect access to the database and queue.

## 5. Components and the Problems They Solve

- **Client:** Provides the user interface and sends API requests; it avoids requiring users to interact directly with database systems.
- **DNS:** Resolves the service name to the correct network entry point.
- **CDN:** Serves static assets from locations closer to users, reducing latency and origin traffic.
- **Load balancer:** Distributes requests across healthy application instances and stops sending traffic to failed instances.
- **Application servers (at least two):** Run API logic, validate requests, authenticate users, and access data; multiple instances allow horizontal scaling.
- **Cache:** Stores frequently requested data temporarily, reducing repeated database reads and response time; cached private data must be isolated by user and permissions.
- **Primary database:** Provides the authoritative durable store for writes and transactional consistency.
- **Read replica:** Serves eligible read queries and reduces read load on the primary; replication lag means some reads may briefly be stale.
- **Queue:** Buffers asynchronous work so slow tasks do not hold up API responses and traffic spikes can be absorbed.
- **Worker:** Processes queued jobs such as notifications and exports outside the request-response path.

## 6. GET /notes Request Flow

1. The client resolves the API hostname through DNS.
2. The request reaches the load balancer over HTTPS.
3. The load balancer forwards it to a healthy application server.
4. The application server validates the bearer token and identifies the user.
5. The API validates pagination and filters, then checks the cache for a suitable user-scoped result.
6. On a cache hit, the API returns the cached result. On a miss, it queries the read replica when suitable, or the primary if fresh/consistent data is required.
7. The API returns JSON with notes and pagination metadata.
8. The cache may store the result for a short time, with invalidation or expiration rules after writes.

## 7. POST /notes Request Flow

1. The client sends `POST /v1/notes` with a bearer token and JSON title/body.
2. DNS and the load balancer route the request to a healthy application server.
3. The API authenticates the user and validates the title, body size, and request format.
4. The API inserts the note into the primary database within a transaction.
5. If tags are included, the API verifies that they belong to the user and inserts relationships in the same transaction.
6. The API invalidates or updates relevant cache entries.
7. If follow-up work is required, the API publishes a job to the queue; a worker handles it asynchronously.
8. The API returns `201 Created` with the new note representation and identifier.

## 8. Trade-offs

### Cache speed vs freshness

Caching improves read latency and reduces database load, but cached results can become stale. Use short time-to-live values, user-scoped keys, and invalidation after create/update/delete operations. Requests that require strong freshness should read from the primary.

### Read replicas vs consistency

Read replicas spread read traffic, but asynchronous replication can lag behind the primary. Route writes and read-after-write requests to the primary when immediate consistency matters; allow replicas for suitable list and reporting reads.

### SQL transactions vs horizontal write scaling

A relational database provides constraints and transactions that protect data integrity, but scaling writes across many database nodes adds complexity. Start with a well-indexed primary and read replica, monitor capacity, and consider partitioning or sharding only when measured load requires it.

### Queue reliability vs immediate completion

A queue keeps slow jobs out of API response paths, but jobs may be delayed or retried. Make jobs idempotent, use retry limits and a dead-letter queue, and monitor queue depth.

## 9. Avoiding Single Points of Failure

- Run at least two application servers across separate failure zones behind a health-checking load balancer.
- Use redundant DNS and CDN provider infrastructure.
- Deploy the cache in a highly available configuration and treat cache loss as a performance issue, not permanent data loss.
- Configure database backups, point-in-time recovery, replica monitoring, and a documented failover procedure; a replica alone is not a substitute for backups.
- Use a durable, replicated queue and multiple workers so one worker failure does not stop all processing.
- Monitor the service with alerts, health checks, and tested recovery runbooks.

A fully redundant design reduces individual component failures, but availability depends on configuration, deployment, testing, and operational response.
