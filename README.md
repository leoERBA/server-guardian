# Server Guardian

> Lightweight security monitoring for Linux servers, built step by step toward AI-driven defensive agents.

Server Guardian is an early-stage B2B cybersecurity project focused on building a lightweight security and monitoring layer for Linux servers and VPS infrastructure.

The project started with a simple goal: provide useful server protection without the resource consumption, complexity, and infrastructure requirements commonly associated with large enterprise security platforms.

The current development phase is focused on building the secure foundation required for a Linux monitoring agent, including authentication, server management, agent enrollment, credential handling, and eventually heartbeat-based communication.

---

## Project Status

Server Guardian is currently under active development.

### Implemented

- User authentication
- Sign up and login flows
- Supabase integration
- Server registration and management
- Server dashboard pages
- Secure enrollment token generation
- SHA-256 hashing of enrollment tokens
- 15-minute enrollment token expiration
- Single-use enrollment flow implemented in the API
- Initial permanent agent credential generation
- Server-side privileged Supabase client

### In Progress

- End-to-end validation of the agent enrollment flow
- Database permission validation for agent enrollment
- Permanent agent credential validation

### Planned

- Lightweight Linux agent written in Python
- One-line Bash installer
- Agent heartbeat system
- Server health monitoring
- Security event collection
- Lightweight rule-based threat detection
- Alerting and incident visibility

---

## Architecture

The current architecture is being developed around a lightweight agent-to-platform model.

```text
┌──────────────────────┐
│   Linux Server/VPS   │
│                      │
│  Server Guardian     │
│  Python Agent        │
└──────────┬───────────┘
           │
           │ Secure API communication
           ▼
┌──────────────────────┐
│    Server Guardian   │
│      Backend API     │
│                      │
│      Next.js         │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Supabase       │
│                      │
│ Authentication      │
│ Database            │
│ Agent Credentials   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│      Dashboard       │
│                      │
│ Servers              │
│ Status               │
│ Security Events      │
└──────────────────────┘
```

The long-term objective is to keep the endpoint component lightweight while moving more complex coordination and analysis into the platform.

---

## Secure Agent Enrollment

One of the first security-sensitive components being developed is the agent enrollment system.

The current flow is designed around temporary enrollment tokens:

```text
User creates a server
        ↓
Dashboard generates an enrollment token
        ↓
Raw token is returned once
        ↓
SHA-256 hash is stored in the database
        ↓
Token expires after 15 minutes
        ↓
Linux agent submits token to the enrollment API
        ↓
Token is validated and consumed
        ↓
Permanent agent credential is generated
        ↓
Only the credential hash is stored
```

Enrollment tokens use the prefix:

```text
sg_enroll_
```

Agent credentials use:

```text
sg_agent_
```

Raw secrets are not intended to be permanently stored in the database.

> The enrollment implementation is currently undergoing end-to-end validation before development of the Linux agent continues.

---

## Security Principles

Server Guardian is being developed with several security principles in mind:

- Never store raw long-term credentials when a secure hash is sufficient
- Keep privileged credentials server-side
- Use short-lived enrollment credentials
- Make enrollment credentials single-use
- Separate user authentication from agent authentication
- Minimize dependencies when native functionality is sufficient
- Reduce unnecessary CPU and memory consumption on monitored servers
- Document security decisions and failures throughout development

Environment secrets are stored locally and are not committed to the repository.

---

## Technology Stack

### Web Platform

- Next.js
- TypeScript
- React

### Backend and Data

- Supabase
- PostgreSQL
- Supabase Authentication

### Agent

Planned:

- Python
- Linux
- Bash installer

The agent is intended to remain lightweight and rely on Python's standard library whenever practical.

---

## Development Roadmap

### Phase 1 — Platform Foundation

- [x] Authentication
- [x] User sessions
- [x] Server dashboard
- [x] Server registration
- [x] Supabase integration

### Phase 2 — Secure Agent Enrollment

- [x] Temporary enrollment token generation
- [x] Token hashing
- [x] Token expiration
- [x] Agent enrollment API
- [ ] Complete end-to-end enrollment validation
- [ ] Validate permanent agent credentials
- [ ] Improve enrollment atomicity

### Phase 3 — Linux Agent

- [ ] Python agent foundation
- [ ] Secure local configuration
- [ ] One-line installation script
- [ ] Agent authentication
- [ ] Heartbeat communication

### Phase 4 — Monitoring

- [ ] Server health telemetry
- [ ] Security event collection
- [ ] Lightweight log analysis
- [ ] Rule-based threat detection
- [ ] Dashboard alerts

### Phase 5 — Intelligent Defense

Research and long-term development:

- [ ] Controlled local Red Team simulations
- [ ] Defensive agent learning
- [ ] Coordinated Blue Team agents
- [ ] Adaptive threat response
- [ ] Swarm Defense architecture

---

## Long-Term Vision

Server Guardian started as a lightweight B2B security project focused on protecting Linux servers from automated threats.

The long-term vision is to move beyond static rule-based detection toward coordinated defensive agents.

The concept behind **Swarm Defense** is to explore whether controlled Red Team simulations can help continuously improve Blue Team agents and allow defensive components to coordinate responses across cloud infrastructure.

The goal is an adaptive security layer capable of detecting, learning, and responding while avoiding the latency, infrastructure requirements, and cost associated with traditional enterprise security platforms.

This is a long-term research direction and is **not part of the current production implementation**.

---

## Development Philosophy

Server Guardian is being built incrementally.

Instead of hiding unfinished work, this repository documents:

- architectural decisions
- security improvements
- implementation milestones
- technical problems
- failed assumptions
- fixes
- lessons learned during development

The objective is to maintain a transparent engineering history as the system evolves.

---

## Running the Web Application Locally

Install the project dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

A configured Supabase project and the required environment variables are necessary for authentication and backend functionality.

> Never commit `.env.local` or privileged Supabase credentials to the repository.

---

## Current Development Focus

The immediate engineering milestone is:

```text
Complete agent enrollment
        ↓
Validate permanent agent credentials
        ↓
Build Linux agent
        ↓
Implement heartbeat
        ↓
Begin monitoring
```

Development progress will continue to be documented through focused Git commits.

---

## License

No open-source license has been selected yet.

Until a license is explicitly added, the presence of the source code in this public repository should not be interpreted as granting permission to copy, redistribute, modify, or commercially reuse the project.

---

## Project

**Server Guardian**

Lightweight security monitoring for Linux infrastructure with a long-term research direction toward coordinated AI-driven defensive systems.