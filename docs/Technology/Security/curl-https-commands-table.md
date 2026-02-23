---
title: Curl HTTPS Diagnostic cheatsheet
description: A quick reference table of curl commands for diagnosing HTTPS connections, TLS handshakes, and certificate issues.
sidebar_label: Curl HTTPS Diagnostic cheatsheet
tags:
  - curl
  - https
  - tls
  - ssl
  - security
  - cli
  - commands
  - cheatsheet
---

# Curl HTTPS Diagnostic Commands

A quick reference table for common `curl` commands used to diagnose HTTPS connections, TLS handshakes, certificate validation, and proxy configurations.

| Command | What It Does |
|---------|--------------|
| `curl -v https://host/` | Performs full HTTPS request with verbose output (DNS, TCP, TLS handshake, certificate validation, HTTP response). |
| `curl -I https://host/` | Fetches only HTTP response headers. |
| `curl -v --tlsv1.2 https://host/` | Forces TLS 1.2 during handshake to test protocol compatibility. |
| `curl -v --tlsv1.3 https://host/` | Forces TLS 1.3 during handshake. |
| `curl -vk https://host/` | Skips certificate validation (insecure; for debugging only). |
| `curl -v --cacert ca.pem https://host/` | Uses a specific CA certificate file to validate the server certificate. |
| `curl -v --capath /path/to/ca-dir https://host/` | Uses a directory of CA certificates for validation. |
| `curl -v --cert client.pem --key client.key https://host/` | Performs mTLS using client certificate and private key. |
| `curl -v --cert client.p12:password --cert-type P12 https://host/` | Performs mTLS using PKCS12 client certificate file. |
| `curl -v -x http://proxy:8080 https://host/` | Sends HTTPS request through an HTTP proxy. |
| `curl -v -x http://proxy:8080 -U user:pass https://host/` | Sends HTTPS request through authenticated proxy. |
| `curl -v --resolve host:443:IP https://host/` | Bypasses DNS and forces connection to specific IP while preserving hostname (SNI). |
| `curl -v --trace-time --trace-ascii trace.log https://host/` | Writes detailed TLS and request trace logs to a file. |
| `curl -o /dev/null -s -w "%{http_code}\n" https://host/` | Returns only the HTTP status code. |
| `curl -v -u user:pass https://host/api/system/ping` | Tests HTTPS endpoint with Basic Authentication. |
| `curl -v https://host/ 2>&1 \| grep -i expire` | Extracts certificate expiry details from verbose output. |

:::tip
Replace `host` with your actual hostname (e.g., `artifactory.yourcompany.com`).
:::
