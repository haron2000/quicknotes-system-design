# QuickNotes System Architecture

## 1. Overview

QuickNotes is a web-based note-taking system where users can create, view, update, and delete notes. The system is designed to support a growing number of users while maintaining good performance, availability, security, and reliability.

The architecture uses multiple application servers, caching, a primary database with a read replica, and asynchronous background processing through a queue and worker.

## 2. Functional Requirements

The system should:

1. Allow users to register and log in.
2. Allow authenticated users to create notes.
3. Allow users to view a list of their notes.
4. Allow users to view individual notes.
5. Allow users to update notes.
6. Allow users to delete notes.
7. Allow users to organize notes using tags.
8. Provide appropriate error messages for failed requests.
9. Support background tasks such as notifications, audit logging, or search indexing.

## 3. Non-Functional Requirements

The system should provide:

* **Performance:** Common API requests should respond quickly under normal load.
* **Scalability:** Additional application servers can be added as the number of users increases.
* **Availability:** Failure of one application server should not make the whole application unavailable.
* **Security:** Authentication, authorization, input validation, HTTPS, and secure password storage should be used.
* **Reliability:** User data should be stored durably and backed up.
* **Maintainability:** The application should be separated into manageable components.
* **Observability:** Logs, metrics, and health checks should help identify failures and performance problems.

## 4. Load Estimate

The following estimate assumes **1,000,000 registered users**.

### Assumptions

* 1,000,000 registered users
* 10% are active on a typical day
* 100,000 daily active users
* Each active user views approximately 30 note pages per day
* Each active user creates approximately 2 notes per day
* Average stored note data is approximately 2 KB
* Traffic is averaged across 24 hours
* Peak traffic is estimated at 5 times the average

### Read Traffic

Daily active users:

`1,000,000 × 10% = 100,000 users`

Daily reads:

`100,000 × 30 = 3,000,000 reads/day`

Average reads per second:

`3,000,000 ÷ 86,400 ≈ 35 reads/second`

Estimated peak:

`35 × 5 ≈ 175 reads/second`

### Write Traffic

Daily writes:

`100,000 × 2 = 200,000 writes/day`

Average writes per second:

`200,000 ÷ 86,400 ≈ 2.3 writes/second`

Estimated peak:

`2.3 × 5 ≈ 11.5 writes/second`

### Storage

Annual notes created:

`200,000 × 365 = 73,000,000 notes/year`

Estimated storage:

`73,000,000 × 2 KB = 146,000,000 KB`

This is approximately **146 GB of new note data per year**.

This storage estimate represents note data only and does not include database indexes, database overhead, backups, replicas, logs, or other application data.

## 5. High-Level Architecture

text
Client (Browser)
      |
      v
     DNS
      |
      v
     CDN
      |
      v
Load Balancer
      |
      +------------------+
      |                  |
      v                  v
App Server 1         App Server 2
      |                  |
      +--------+---------+
               |
        +------+------+------+
        |      |             |
        v      v             v
      Cache  Primary DB    Queue
                 |
                 v
            Read Replica
                               |
                               v
                             Worker


## 6. Component Responsibilities

* **Client:** Provides the user interface through which users interact with QuickNotes.
* **DNS:** Converts the QuickNotes domain name into the network endpoint used to reach the application.
* **CDN:** Reduces latency and application-server load by serving static assets and suitable cacheable responses from locations closer to users.
* **Load Balancer:** Distributes incoming requests across multiple application servers so that one server does not become a bottleneck.
* **App Server 1:** Processes API requests and provides one application instance for handling user traffic.
* **App Server 2:** Provides another application instance so traffic can continue if the first server becomes unavailable.
* **Cache:** Stores frequently requested data temporarily to reduce database queries and improve response times.
* **Primary Database:** Stores the authoritative application data and handles write operations.
* **Read Replica:** Handles read-heavy queries so that read traffic does not overload the primary database.
* **Queue:** Holds background jobs so that slow or non-critical work does not delay API responses.
* **Worker:** Processes queued background jobs independently from the application servers.

## 7. GET /notes Request Flow

When a user requests their notes, the request follows these steps:

1. The browser sends a `GET /notes` request.
2. DNS resolves the QuickNotes domain to the application endpoint.
3. The CDN checks whether the requested content can be served from its cache.
4. If the request is not available from the CDN, it is forwarded to the load balancer.
5. The load balancer selects a healthy application server.
6. The application server authenticates the user and validates the request.
7. The application server checks the application cache for the user's notes.
8. If the notes are found in the cache, they are returned without querying the database.
9. If there is a cache miss, the application server queries the read replica.
10. The returned notes are placed in the cache for future requests.
11. The application server sends the notes back through the load balancer and CDN to the browser.

This flow reduces database load because frequently accessed notes can be served from the cache and normal read traffic is handled by the read replica.

## 8. POST /notes Request Flow

When a user creates a note, the request follows these steps:

1. The browser sends a `POST /notes` request containing the note title and body.
2. DNS resolves the QuickNotes domain.
3. The request reaches the load balancer.
4. The load balancer sends the request to a healthy application server.
5. The application server authenticates the user and validates the submitted data.
6. The application server sends the new note to the primary database.
7. The primary database stores the note and returns the new note ID.
8. The application server can place non-critical background work, such as notifications or search indexing, onto the queue.
9. A worker processes the queued task independently.
10. The application server returns a `201 Created` response to the browser.
11. The newly created note can be returned in the response so the interface can update immediately.

Writes go to the primary database because it is the authoritative source for changes to the data.

## 9. Scalability and Availability

The application layer avoids a single application-server failure by running at least two application servers behind the load balancer.

The database layer uses a primary database and read replica so that read traffic can be separated from write traffic.

The production database should use automated failover or a standby primary because a read replica by itself is not a complete replacement for database high availability.

The load balancer should be provided as a highly available managed service or deployed redundantly so that it does not become a single point of failure.

The queue should use durable storage and multiple workers should be available so that background processing can continue if one worker fails.

Cache failure should not stop the application; the application should fall back to the database when cached data is unavailable.

## 10. Architecture Trade-Offs

### Trade-Off 1: Caching vs Data Freshness

Caching improves performance and reduces database load, but cached data can become outdated. QuickNotes can use short cache lifetimes and invalidate relevant cache entries after note updates to balance performance and freshness.

### Trade-Off 2: Read Replicas vs Consistency

Read replicas allow the system to handle more read traffic, but replication can introduce a small delay between the primary database and replica. Operations that require the newest data can read from the primary database when necessary.

### Trade-Off 3: Queue-Based Processing vs Simplicity

A queue allows slow background work to happen without delaying user requests, but it adds another infrastructure component to maintain. Only non-critical or asynchronous work should be placed on the queue.

### Trade-Off 4: Multiple Application Servers vs Infrastructure Cost

Running multiple application servers improves availability and scalability, but it increases infrastructure costs and operational complexity. The number of servers can be scaled according to actual traffic.

## 11. Failure Handling

The architecture is designed to avoid major single points of failure:

* Multiple application servers prevent one application server from taking down the system.
* A highly available load balancer prevents the traffic-routing layer from becoming a single point of failure.
* Database failover or a standby primary protects against primary database failure.
* A read replica reduces pressure on the primary database.
* Multiple workers prevent one worker failure from stopping background processing.
* Durable queues prevent background jobs from being lost during temporary worker failures.
* Cache failures fall back to database reads instead of making the entire application unavailable.
* Monitoring and health checks allow unhealthy servers to be removed from traffic automatically.

## 12. Conclusion

The proposed QuickNotes architecture separates user requests, application processing, caching, database operations, and background work into independent components. Multiple application servers and a load balancer provide horizontal scalability, while caching and a read replica handle the read-heavy workload. The primary database provides reliable writes, while the queue and workers allow background tasks to run without slowing down user-facing requests.

This architecture can start with a small number of servers and scale horizontally as the number of QuickNotes users grows.
