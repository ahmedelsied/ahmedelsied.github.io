---
title: "Database Replication Explained: Techniques and Challenges"
description: "How database replication copies data across machines, and the trade-offs in synchronous and asynchronous replication, failover, lag, and single-leader, multi-leader, and leaderless designs."
date: 2025-06-27
updatedAt: 2025-10-04
lang: en
readingMinutes: 15
keywords:
  - database replication
  - leader and follower
  - synchronous replication
  - asynchronous replication
  - failover
  - replication lag
  - quorum
---

## Introduction

The term *database replication* is most often associated with *database scaling*.  
Database replication is a powerful technique used to enhance the scalability, reliability, and performance of database systems

Simply put, it means **copying the database and placing it on different machines** so we can handle the load resulting from scaling.

Before diving into the various replication methods, let’s first explore some key terms to build a solid foundation for understanding this critical concept.

## Leader and Follower

In database replication, the term *Leader* is the primary database instance that handles all write operations and, in some cases, read operations.

The *Follower* is a replica that mirrors the Leader’s data, typically used for read-only queries to distribute workload and enhance scalability.

But wait, how do we ensure consistency when reading from the Follower? Well, ensuring consistency between the Leader and Follower is critical but challenging.

However, the Leader simply writes to the followers. So, it’s basically like this:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1748251462776/b2f307dc-2bce-4b3f-879c-512b572cffa7.png)

And when we talk about communication between two nodes over network, this is where *Synchronous and Asynchronous Replication* come in.

## Synchronous vs Asynchronous Replication

Replication occurs in two ways: *synchronous* and *asynchronous*, each with its own trade-offs

Lets take a look on the following diagram, which illustrates a user making an update query at a specific moment. The Leader stores the data and replicates it to two Follower nodes: one synchronously and the other asynchronously (this is called *semi-synchronous*). We notice that the user gets confirmation before the second Follower fully replicates the data.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1748282993019/8059d2ba-84c9-433a-82d6-7259b6b8990e.png)

So from the diagram We can conclude some advantages and disadvantages for both ways,

* **Synchronous Replication**
    
    * **Advantages:**
        
        * **Guaranteed Consistency**: The Follower maintains an up-to-date copy of the data, ensuring no conflicts between the Leader and synchronous Followers.
            
        * If the leader fails for any reason, we can easily replace it with any synchronous follower
            
        * **Seamless Failover:** If the Leader fails, a synchronous Follower can be immediately promoted to become the new Leader.
            
    * **Disadvantages:**
        
        * **Increased Latency**: Users must wait for all synchronous Followers to confirm updates, potentially slowing down response times.
            
        * **System Failure Risk**: If a synchronous Follower becomes unavailable, the Leader must wait for it to recover, which can lead to a completely system failure.
            
* **Asynchronous Replication**
    
    * **Advantages:**
        
        * **Enhanced Availability**: Users receive confirmation without waiting for asynchronous Followers to update, ensuring faster response times.
            
        * **Fault Tolerance**: If an asynchronous Follower fails, the system continues operating, and the Follower can sync later once it’s back online. (check follower failure)
            
    * **Disadvantages:**
        
        * If the leader fails for any reason, it’s a big problem because there’s no guarantee that the follower replica we promote to leader will have an up-to-date copy of the data
            
        * **Inconsistency and Data-loss Risks**: If the Leader fails, promoting an asynchronous Follower to Leader may result in data loss, as it may not have the most recent data changes.
            

The disadvantages of the synchronous approach make it impractical to have all followers synchronized. In practice, enabling synchronous replication in a database typically means that only one follower is synchronous, while the others are asynchronous. This is sometimes called semi-synchronous replication.

However, a fully asynchronous approach is often used in the *Single-Leader replication* method. This means that a write is not guaranteed to be durable, even if it has been confirmed to the client.

Weakening durability may sound like a bad trade-off, but it is widely used especially when there are many followers or when they are geographically distributed.

## Follower Failure

In any distributed system, nodes can fail at any time, so it’s important to ask: what happens if a Follower goes down? And how do we bring it back online?

Actually, each Follower keeps a log of data changes on its local disk. So, if the Follower fails, it can use this log to recover its previous state, then reconnect to the Leader and request the data changes that occurred during its downtime. This process is known as *catch-up recovery*. Bringing the Follower back sounds easy, but what happens if the Leader fails?

## Leader Failure

As we mentioned, any node in the system can go down, so let’s consider the leader.

If the Leader fails, we need one of the Followers that is up-to-date with the Leader (synchronized) to be promoted to the new Leader. The system must then be reconfigured to send writes to the new Leader, and the Followers need to start consuming data changes from the new Leader. This process is called *Failover*.

So, it happens in three steps:

1. Determining that the leader has failed
    
2. Choosing new leader
    
3. Reconfigure the system to use the new leader
    

However, there are some issues to consider:

* What if asynchronous replication was used? the new leader may not have received all the writes from the old leader, and what if the old Leader return back after a new leader has been chosen? The new leader may have accepted conflicting writes in the meantime. the solution is to discard the old leader’s un-replicated writes. which violates client’s *durability* expectation
    
* Another issue arises as a consequence of this solution :-)
    
    ![](https://cdn.hashnode.com/res/hashnode/image/upload/v1748850143550/00973b38-3c0e-49e2-b752-05299e37769f.jpeg)
    
    Discarding writes is a risky approach, particularly when other storage systems or external services are integrated with the database and must remain consistent with its contents. Losing un-replicated writes can lead to data discrepancies, inconsistencies, and potential integrity issues across the entire system. A real-world example of this occurred at **GitHub**:
    
    * An out-of-date follower was promoted to Leader while the database was using auto-incrementing IDs to assign primary keys to new records.
        
        Because the new Leader’s counter lagged behind that of the old leader, it reused some primary keys that had already been assigned. These same primary keys were also used in the Redis store, causing inconsistencies between **MySQL and Redis**, which resulted in some private data being disclosed to the wrong users.
        

## Replication Lag

*Replication lag* refers to the delay between when a write is committed on the leader and when it is fully replicated to all followers. During this window of time, several issues can arise that may impact data consistency and system behavior.

To make this clearer, let’s look at the diagram below:-

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1748705571416/2fba492b-0dfe-4553-bdc6-0f6fdfb3b9f8.png)

The user inserts the data then receives a success message, and then attempts to read it from Follower 2 (which is temporarily outdated). The red area represents the replication lag period.

Based on the diagram, the following issues may arise due to replication lag:

* *Read-After-Write*: A user might insert data and immediately attempt to read it, only to find it missing.
    
* *Monotonic reads*: A user may read a piece of data once, then read it again later and find it has disappeared
    
* *Consistent prefix reads*: A user could observe data in an illogical order, seeing newer data before older data.
    

## Single-Leader Replication

In this method, clients send all write operations to the Leader, which then streams data change events to the Followers.

Reads can be performed on any replica, but they might return stale data.

Single-leader replication can be illustrated as follows:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1750948256519/9cd20c36-2829-4935-8e52-d91808c7e4f4.png)

### Advantages

* Routing all writes through a single leader greatly simplifies consistency guarantees.
    
* Read operations can be distributed across all follower replicas, significantly improving performance and scalability in read-heavy workloads.
    

### Disadvantages

* The Leader becomes a bottleneck for write operations, which can limit performance and scalability in *write-intensive* applications
    
* If the Leader fails, writes will not be accepted until a synchronized Follower is promoted to leader (not fault-tolerant for writes).
    
* Without a fast failover process, a Leader failure can become a *single point of failure* for the entire system
    
* Scalability issues may occur when adding replicas across different regions, as this increases the load on the leader to write data to followers, leading to higher latency
    

### When to use?

* If the system is read-intensive with less writes.
    
* When consistency is more important than availability
    
* If the system is not geo-distributed
    

## Multi-Leader Replication

In this method, clients send each write to one of several Leaders, any of which can accept writes. The Leaders send streams of data change events to each other and to any Follower nodes.

So it will be something like this:

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1750949617512/f0e0a802-9576-4b6a-8318-a9db6e1081e7.png)

### Advantages

* **High Availability and Fault Tolerance** because if one leader fails there are other leaders can handle writes
    
* No single write bottleneck because the writes is distributed across all the leaders (*Write-Scalability*)
    
* Lower latency for distributed systems because the user can write to the nearest leader
    

### Disadvantages

* Concurrent writes to the same data item on different leaders can conflict, and resolving these conflicts is complex. Strategies such as *Last-Write-Wins*, app-specific (LWW) logic, *Conflict-free Replicated Data Types* **(CRDTs)**, timestamps, or *consensus protocols*. (Conflict Resolution is not covered here)
    
* Increased system complexity due to the need for conflict detection and resolution mechanisms.
    
* different Leaders may temporarily have inconsistent data (*Eventual Consistent*)
    

### When to use?

* When availability is more important than consistency
    
* When the system is write-intensive
    
* When the system is geographically distributed
    

## Leader-less Replication (**Dynamo style**)

This method is slightly different because there are no Follower or Leader concepts, so **any node can accept reads and writes**, and the data is synchronized across replicas without a single leader.

So, how are reads and writes handled in this replication method?

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1751030925347/6cce644e-94e9-4f17-b4ad-7f57352dd998.png)

Here is how it going, When a client writes data, the request is sent to multiple nodes in parallel. The number of replicas that must acknowledge the write for it to be considered successful is called the *write quorum*

### Quorum

Quorum is the way that we depend on it to decide if the write operation is successful or not

The quorum is represented by the following mathematical inequality:

> `W + R > N`

Which:

`N` is the total number of nodes

`W` Is the minimum nodes that must acknowledge a write to be considered as a successful write operation

`R` Is the minimum nodes that must respond to a read to be considered as a successful read operation

So for example:

If we have 5 nodes the quorum may be something like `3+3 > 5` So here we must have 3 successful nodes in write operation and 3 successful nodes in read operation

But what if the reachable nodes is less than `W` in writes operation and less than `R` in read operation?

Here comes the *sloppy quorum.*

### Sloppy Quorum

In leader-less replication the database designers face a trade-off:

* Should the system return an error for all requests when it cannot reach a quorum for reads or writes?
    
* Or should it accept writes on any available nodes, allowing those nodes to temporarily store the updates? Once the unavailable nodes come back online, they can catch up by receiving the updates from the up-to-date nodes. For reads, is it acceptable to occasionally return stale data?
    

Sloppy quorum refers to the second approach. It is chosen because the primary goal of leaderless replication is high availability. Rather than returning an error or making the user wait until the intended nodes are available, the system temporarily writes to any available nodes. This process is known as *hinted handoff.*

Unlike a strict quorum, a sloppy quorum does not guarantee strong consistency. Instead, it prioritizes durability and availability, ensuring that writes are not lost even if some nodes are temporarily unreachable.

### Advantages

* Writes succeed as long as some nodes are available, providing the system a very **high availability**.
    
* New nodes can be added easily, simplifying the scalability process.
    
* When a node fails, writes can still be processed, resulting in high fault tolerance.
    

### Disadvantages

* Reads may return stale data until synchronization is complete **(Eventual Consistency)**.
    
* Conflict resolution is required, since writes can be processed by multiple nodes concurrently, leading to potential conflicts. techniques like **LWW ,CRDTs** or other methods may be used.
    
* Background processes are needed to fix inconsistencies, such as *read-repair* and hinted handoff.
    

### When to use?

* When your application availability is necessary for reads and writes even if some nodes are down or unreachable (**High Available).**
    
* When your system is **write-intensive** and you want to avoid bottlenecks that caused by a single leader.
    
* When it’s okay to read stale-data temporary **(Eventual Consistency)**
    

## Conclusion

Database replication is a critical technique for scalability. However, it also introduces challenges such as ensuring consistency, handling replication lag, and managing leader and follower issues. Different replication methods, including single-leader ,multi-leader or leader-less replication and each one of them introduces a trade-offs between consistency, availability, scalability and fault-tolerance.

Understanding these methods and their trade-offs is essential to be able to choose between them and design a robust and efficient systems that meet specific application requirements.

## References

[https://www.amazon.eg/-/en/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321](https://www.amazon.eg/-/en/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321)

[https://www.amazon.science/publications/dynamo-amazons-highly-available-key-value-store](https://www.amazon.science/publications/dynamo-amazons-highly-available-key-value-store)
