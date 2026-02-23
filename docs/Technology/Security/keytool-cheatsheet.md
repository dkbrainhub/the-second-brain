---
title: Java Keytool Commands Cheatsheet
sidebar_position: 6
description: A comprehensive reference of Java keytool commands for managing keystores, certificates, and trust stores.
sidebar_label: Keytool Cheatsheet
tags:
  - keytool
  - java
  - keystores
  - certificates
  - pki
  - security
  - ssl
  - tls
  - cheatsheet
  - cli
  - commands
---

# Java Keytool Commands Cheatsheet

A quick reference for Java keytool commands used for managing keystores, certificates, key pairs, and trust stores.

## Keystore Types

| Type | Description |
|------|-------------|
| JKS | Java KeyStore (legacy, Java-specific format). |
| PKCS12 | Industry-standard format (recommended, cross-platform). |
| JCEKS | Java Cryptography Extension KeyStore (supports secret keys). |

## Creating Keystores & Key Pairs

| Command | What It Does |
|---------|--------------|
| `keytool -genkeypair -alias mykey -keyalg RSA -keysize 2048 -keystore keystore.jks` | Generates an RSA key pair and self-signed certificate in JKS. |
| `keytool -genkeypair -alias mykey -keyalg RSA -keysize 2048 -storetype PKCS12 -keystore keystore.p12` | Generates a key pair in PKCS12 format. |
| `keytool -genkeypair -alias mykey -keyalg EC -groupname secp256r1 -keystore keystore.p12` | Generates an EC key pair using P-256 curve. |
| `keytool -genkeypair -alias mykey -keyalg RSA -keysize 4096 -validity 365 -keystore keystore.jks -dname "CN=myserver,OU=IT,O=Company,L=City,ST=State,C=US"` | Generates a key pair with specified distinguished name and validity. |
| `keytool -genkeypair -alias mykey -keyalg RSA -keysize 2048 -ext san=dns:example.com,dns:www.example.com,ip:192.168.1.1 -keystore keystore.jks` | Generates a key pair with Subject Alternative Names (SAN). |

## Listing Keystore Contents

| Command | What It Does |
|---------|--------------|
| `keytool -list -keystore keystore.jks` | Lists all entries in the keystore (summary). |
| `keytool -list -v -keystore keystore.jks` | Lists all entries with full details. |
| `keytool -list -v -alias mykey -keystore keystore.jks` | Shows details for a specific alias. |
| `keytool -list -rfc -keystore keystore.jks` | Lists certificates in PEM format. |
| `keytool -list -v -keystore keystore.p12 -storetype PKCS12` | Lists PKCS12 keystore contents. |
| `keytool -list -v -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit` | Lists the default Java trust store. |

## Certificate Signing Requests (CSR)

| Command | What It Does |
|---------|--------------|
| `keytool -certreq -alias mykey -keystore keystore.jks -file request.csr` | Generates a CSR for an existing key pair. |
| `keytool -certreq -alias mykey -ext san=dns:example.com -keystore keystore.jks -file request.csr` | Generates a CSR with SAN extension. |
| `keytool -printcertreq -file request.csr` | Displays CSR contents. |

## Importing Certificates

| Command | What It Does |
|---------|--------------|
| `keytool -importcert -alias myca -file ca.crt -keystore truststore.jks` | Imports a CA certificate into a trust store. |
| `keytool -importcert -alias myca -file ca.crt -keystore truststore.jks -trustcacerts` | Imports a CA certificate as a trusted CA. |
| `keytool -importcert -alias mykey -file signed.crt -keystore keystore.jks` | Imports a signed certificate reply for an existing key. |
| `keytool -importcert -alias myca -file ca.crt -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit` | Imports a CA into the default Java trust store. |
| `keytool -importcert -alias mykey -file cert.pem -keystore keystore.jks -noprompt` | Imports without confirmation prompt. |

## Exporting Certificates

| Command | What It Does |
|---------|--------------|
| `keytool -exportcert -alias mykey -keystore keystore.jks -file cert.der` | Exports certificate in DER format. |
| `keytool -exportcert -alias mykey -keystore keystore.jks -file cert.pem -rfc` | Exports certificate in PEM format. |
| `keytool -exportcert -alias mykey -keystore keystore.p12 -storetype PKCS12 -file cert.pem -rfc` | Exports from PKCS12 in PEM format. |

## Viewing Certificates

| Command | What It Does |
|---------|--------------|
| `keytool -printcert -file cert.pem` | Displays certificate details from a file. |
| `keytool -printcert -file cert.der` | Displays DER-encoded certificate details. |
| `keytool -printcert -sslserver host:443` | Displays server certificate from a remote host. |
| `keytool -printcert -sslserver host:443 -rfc` | Downloads server certificate in PEM format. |
| `keytool -printcert -jarfile myapp.jar` | Shows certificate used to sign a JAR file. |

## Deleting Entries

| Command | What It Does |
|---------|--------------|
| `keytool -delete -alias mykey -keystore keystore.jks` | Deletes an entry from the keystore. |
| `keytool -delete -alias oldca -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit` | Removes a CA from the default trust store. |

## Modifying Entries

| Command | What It Does |
|---------|--------------|
| `keytool -changealias -alias oldname -destalias newname -keystore keystore.jks` | Renames an alias. |
| `keytool -storepasswd -keystore keystore.jks` | Changes the keystore password. |
| `keytool -keypasswd -alias mykey -keystore keystore.jks` | Changes the password for a specific key entry. |

## Keystore Conversion

| Command | What It Does |
|---------|--------------|
| `keytool -importkeystore -srckeystore keystore.jks -destkeystore keystore.p12 -deststoretype PKCS12` | Converts JKS to PKCS12. |
| `keytool -importkeystore -srckeystore keystore.p12 -srcstoretype PKCS12 -destkeystore keystore.jks -deststoretype JKS` | Converts PKCS12 to JKS. |
| `keytool -importkeystore -srckeystore source.jks -destkeystore dest.jks -srcalias mykey -destalias newkey` | Copies a specific entry between keystores. |
| `keytool -importkeystore -srckeystore keystore.jks -destkeystore keystore.p12 -deststoretype PKCS12 -srcalias mykey` | Exports a single alias to PKCS12. |

## Working with PKCS12 Files

| Command | What It Does |
|---------|--------------|
| `keytool -list -v -keystore bundle.p12 -storetype PKCS12` | Lists contents of a PKCS12 file. |
| `keytool -importkeystore -srckeystore bundle.p12 -srcstoretype PKCS12 -destkeystore keystore.jks` | Imports PKCS12 into JKS. |
| `keytool -exportcert -alias 1 -keystore bundle.p12 -storetype PKCS12 -file cert.pem -rfc` | Exports certificate from PKCS12. |

## Trust Store Management

| Command | What It Does |
|---------|--------------|
| `keytool -list -v -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit` | Lists default Java CA certificates. |
| `keytool -importcert -alias customca -file ca.crt -keystore truststore.jks -storetype JKS` | Creates a custom trust store with a CA. |
| `keytool -list -keystore truststore.jks \| grep -i "alias"` | Searches for aliases in a trust store. |

## Verification & Debugging

| Command | What It Does |
|---------|--------------|
| `keytool -list -v -alias mykey -keystore keystore.jks \| grep -i "valid"` | Checks certificate validity dates. |
| `keytool -list -v -alias mykey -keystore keystore.jks \| grep -i "sha256"` | Shows certificate fingerprint. |
| `keytool -printcert -sslserver host:443 \| grep -i "valid"` | Checks remote server certificate validity. |

## Common Options Reference

| Option | Description |
|--------|-------------|
| `-keystore <file>` | Specifies the keystore file path. |
| `-storetype <type>` | Specifies keystore type (JKS, PKCS12, JCEKS). |
| `-storepass <password>` | Keystore password (use `:env` or `:file` prefix for security). |
| `-keypass <password>` | Private key password. |
| `-alias <name>` | Entry alias name. |
| `-validity <days>` | Certificate validity period in days. |
| `-dname <name>` | Distinguished name for certificate subject. |
| `-ext <extension>` | X.509 extension (e.g., `san=dns:example.com`). |
| `-v` | Verbose output. |
| `-rfc` | Output in PEM/RFC format. |
| `-noprompt` | Skip confirmation prompts. |
| `-trustcacerts` | Trust certificates from cacerts file. |

:::tip
The default Java trust store is located at `$JAVA_HOME/lib/security/cacerts` with the default password `changeit`. Always use PKCS12 format for new keystores as JKS is deprecated.
:::

:::warning
Never use `-storepass` or `-keypass` with plain text passwords in production scripts. Use environment variables or password files instead:
- `-storepass:env KEYSTORE_PASS`
- `-storepass:file /path/to/password.txt`
:::
