# How I Found and Bypassed a Spring Boot Actuator Information Disclosure Bug

Original: https://cametom006.medium.com/how-i-found-and-bypassed-a-spring-boot-actuator-information-disclosure-bug-c4930b740a50  
Author: Fahad Faisal • Date: 2024‑07‑18

Greetings! In this writeup I share how I discovered an information disclosure in a Spring Boot Actuator endpoint while hunting a bug bounty program on Inspectiv—and how I later bypassed the fix.

## Methodology

- Subdomain discovery with [haktrails](https://github.com/hakluke/haktrails)  
- Live host filtering with `httpx`  
- Directory fuzzing with a custom wordlist to surface interesting endpoints

## The Spring Boot Actuator Gold Mine

An exposed `/actuator` revealed multiple endpoints worth reviewing:

- `/dump` — threads and stack traces
- `/trace` — last HTTP messages (may include session IDs)
- `/logfile` — application logs
- `/shutdown` — shutdown control
- `/mappings` — MVC mappings
- `/env` — environment configuration
- `/restart` — restarts application

Of particular interest:

- `/env` exposed internal config (credentials redacted but sensitive metadata leaked)
- `/metrics/http.client.requests` revealed customer emails and SQL statements

The issue was triaged and rewarded.

## Attempting to Bypass the Fix

Later, returning to re-test, the endpoint responded with `401 Unauthorized`, indicating the team had hardened access (likely firewall-based).

Using the tool [4-ZERO-3](https://github.com/Dheerajmadhukar/4-ZERO-3), I identified a path parsing quirk that allowed access by appending a semicolon path parameter:

\`\`\`
https://target.tld/actuator;/env
\`\`\`

This bypassed the filter and re-exposed sensitive data. I reported it again and the team remediated promptly.

## Takeaways

- Treat Actuator endpoints as high-signal during recon.
- Validate protections against alternate path parsing and path parameters.
- Re-testing previous bugs can uncover regressions or partial fixes.
