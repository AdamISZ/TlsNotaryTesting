TlsNotaryTesting
================

Testing extension for TlsNotary

Instructions:

add extension to TLSNotary's Firefox

Run: "python tlsnotary-test.py name_of_website_list_file"

where name_of_website_list_file has the same format as the examples websitelist.txt.

Format is : url , whitespace, comma separated list of allowable cipher suites.

Cipher suites are encoded as an integer as specified at the top of the script:

    #for reference (this is what is in the testing add-on)
    tlsnCipherSuiteNames=["security.ssl3.rsa_aes_128_sha","security.ssl3.rsa_aes_256_sha",\
    "security.ssl3.rsa_rc4_128_md5","security.ssl3.rsa_rc4_128_sha"]

Both auditor (in daemon mode) and auditee will be started automatically.

Do not steal focus from the auditee browser; this will prevent the automation of the final file choice step.

Successful test run will be indicated in the stdout of the tlsnotary-test script.

Info and error messages are logged (in append mode) to ./tlsnotarytestlog (hardcoded for now).

