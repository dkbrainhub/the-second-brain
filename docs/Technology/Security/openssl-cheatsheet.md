---
title: OpenSSL Commands Cheatsheet
sidebar_position: 7
description: A comprehensive reference of OpenSSL commands for certificate management, key generation, encryption, and TLS debugging.
sidebar_label: OpenSSL Cheatsheet
tags:
  - openssl
  - ssl
  - tls
  - certificates
  - pki
  - security
  - cryptography
  - cheatsheet
  - cli
  - commands
---

# OpenSSL Commands Cheatsheet

A quick reference for common OpenSSL commands used for certificate management, key generation, encryption, and TLS debugging.

## Certificate & Key Generation

| Command | What It Does |
|---------|--------------|
| `openssl genrsa -out private.key 2048` | Generates a 2048-bit RSA private key. |
| `openssl genrsa -aes256 -out private.key 4096` | Generates a 4096-bit RSA private key with AES-256 encryption (password-protected). |
| `openssl ecparam -genkey -name prime256v1 -out ec.key` | Generates an EC private key using P-256 curve. |
| `openssl req -new -key private.key -out request.csr` | Creates a Certificate Signing Request (CSR) from a private key. |
| `openssl req -new -newkey rsa:2048 -nodes -keyout private.key -out request.csr` | Generates a new private key and CSR in one command. |
| `openssl req -x509 -newkey rsa:2048 -nodes -keyout private.key -out cert.pem -days 365` | Creates a self-signed certificate and key in one command. |
| `openssl req -x509 -key private.key -in request.csr -out cert.pem -days 365` | Signs a CSR to create a self-signed certificate. |

## Certificate Inspection

| Command | What It Does |
|---------|--------------|
| `openssl x509 -in cert.pem -text -noout` | Displays full certificate details in human-readable format. |
| `openssl x509 -in cert.pem -subject -noout` | Shows the certificate subject (CN, O, OU, etc.). |
| `openssl x509 -in cert.pem -issuer -noout` | Shows the certificate issuer. |
| `openssl x509 -in cert.pem -dates -noout` | Shows certificate validity dates (notBefore, notAfter). |
| `openssl x509 -in cert.pem -serial -noout` | Shows the certificate serial number. |
| `openssl x509 -in cert.pem -fingerprint -sha256 -noout` | Shows the SHA-256 fingerprint of the certificate. |
| `openssl x509 -in cert.pem -pubkey -noout` | Extracts the public key from the certificate. |
| `openssl x509 -in cert.der -inform DER -text -noout` | Reads a DER-encoded certificate. |

## CSR Inspection

| Command | What It Does |
|---------|--------------|
| `openssl req -in request.csr -text -noout` | Displays the CSR contents. |
| `openssl req -in request.csr -verify -noout` | Verifies the CSR signature. |
| `openssl req -in request.csr -subject -noout` | Shows the CSR subject. |

## Key Inspection & Management

| Command | What It Does |
|---------|--------------|
| `openssl rsa -in private.key -check` | Checks the consistency of an RSA private key. |
| `openssl rsa -in private.key -text -noout` | Displays private key details. |
| `openssl rsa -in private.key -pubout -out public.key` | Extracts the public key from a private key. |
| `openssl rsa -in encrypted.key -out decrypted.key` | Removes password protection from a private key. |
| `openssl rsa -in private.key -aes256 -out encrypted.key` | Adds password protection to a private key. |
| `openssl ec -in ec.key -text -noout` | Displays EC private key details. |

## Format Conversion

| Command | What It Does |
|---------|--------------|
| `openssl x509 -in cert.pem -outform DER -out cert.der` | Converts PEM to DER format. |
| `openssl x509 -in cert.der -inform DER -outform PEM -out cert.pem` | Converts DER to PEM format. |
| `openssl pkcs12 -export -out bundle.p12 -inkey private.key -in cert.pem` | Creates a PKCS12 bundle from key and certificate. |
| `openssl pkcs12 -export -out bundle.p12 -inkey private.key -in cert.pem -certfile ca.pem` | Creates a PKCS12 bundle including CA chain. |
| `openssl pkcs12 -in bundle.p12 -out all.pem -nodes` | Extracts all contents from PKCS12 to PEM. |
| `openssl pkcs12 -in bundle.p12 -nocerts -out private.key` | Extracts only the private key from PKCS12. |
| `openssl pkcs12 -in bundle.p12 -clcerts -nokeys -out cert.pem` | Extracts only the client certificate from PKCS12. |
| `openssl pkcs12 -in bundle.p12 -cacerts -nokeys -out ca.pem` | Extracts only CA certificates from PKCS12. |

## Certificate Verification

| Command | What It Does |
|---------|--------------|
| `openssl verify -CAfile ca.pem cert.pem` | Verifies a certificate against a CA certificate. |
| `openssl verify -CAfile ca.pem -untrusted intermediate.pem cert.pem` | Verifies with intermediate certificates. |
| `openssl x509 -in cert.pem -noout -modulus \| openssl md5` | Gets modulus hash to compare cert with key. |
| `openssl rsa -in private.key -noout -modulus \| openssl md5` | Gets modulus hash of private key for comparison. |
| `openssl req -in request.csr -noout -modulus \| openssl md5` | Gets modulus hash of CSR for comparison. |

## TLS/SSL Connection Testing

| Command | What It Does |
|---------|--------------|
| `openssl s_client -connect host:443` | Tests TLS connection to a server. |
| `openssl s_client -connect host:443 -showcerts` | Shows all certificates in the chain. |
| `openssl s_client -connect host:443 -servername host` | Tests with SNI (Server Name Indication). |
| `openssl s_client -connect host:443 -tls1_2` | Forces TLS 1.2 connection. |
| `openssl s_client -connect host:443 -tls1_3` | Forces TLS 1.3 connection. |
| `openssl s_client -connect host:443 -cert client.pem -key client.key` | Tests mTLS connection with client certificate. |
| `openssl s_client -connect host:443 -CAfile ca.pem` | Verifies server certificate against specific CA. |
| `openssl s_client -connect host:443 -proxy proxy:8080` | Connects through an HTTP proxy. |
| `openssl s_client -connect host:443 -starttls smtp` | Tests STARTTLS for SMTP. |
| `openssl s_client -connect host:443 -starttls imap` | Tests STARTTLS for IMAP. |
| `openssl s_client -connect host:443 < /dev/null 2>/dev/null \| openssl x509 -noout -dates` | Quickly checks server certificate expiry. |

## Encryption & Hashing

| Command | What It Does |
|---------|--------------|
| `openssl enc -aes-256-cbc -salt -in file.txt -out file.enc` | Encrypts a file with AES-256-CBC. |
| `openssl enc -aes-256-cbc -d -in file.enc -out file.txt` | Decrypts a file encrypted with AES-256-CBC. |
| `openssl dgst -sha256 file.txt` | Calculates SHA-256 hash of a file. |
| `openssl dgst -sha256 -sign private.key -out signature.bin file.txt` | Signs a file with a private key. |
| `openssl dgst -sha256 -verify public.key -signature signature.bin file.txt` | Verifies a signature with a public key. |
| `openssl rand -hex 32` | Generates 32 bytes of random hex data. |
| `openssl rand -base64 32` | Generates 32 bytes of random base64 data. |
| `echo -n "password" \| openssl dgst -sha256` | Hashes a string with SHA-256. |

## Certificate Authority Operations

| Command | What It Does |
|---------|--------------|
| `openssl ca -config ca.cnf -in request.csr -out cert.pem` | Signs a CSR using a CA configuration. |
| `openssl ca -config ca.cnf -revoke cert.pem` | Revokes a certificate. |
| `openssl ca -config ca.cnf -gencrl -out crl.pem` | Generates a Certificate Revocation List (CRL). |
| `openssl crl -in crl.pem -text -noout` | Displays CRL contents. |

## Debugging & Information

| Command | What It Does |
|---------|--------------|
| `openssl version -a` | Shows OpenSSL version and build configuration. |
| `openssl ciphers -v` | Lists all available cipher suites. |
| `openssl ciphers -v 'TLSv1.3'` | Lists TLS 1.3 cipher suites. |
| `openssl list -digest-algorithms` | Lists available digest algorithms. |
| `openssl list -cipher-algorithms` | Lists available cipher algorithms. |
| `openssl speed aes-256-cbc` | Benchmarks AES-256-CBC performance. |

:::tip
Replace `host` with your actual hostname and adjust file paths as needed for your environment.
:::
