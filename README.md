TlsNotaryTesting
================

Testing extension for TlsNotary

Instructions:

add extension to TLSNotary's Firefox

In order for uninterrupted running, modify the tlsnotary extension code to disable the alert windows.

To signal readiness for keyboard input, add the line: help.value = "Beginning the data transfer using sendspace.com...";
as indicated below in script.js: 

    function ss_checkStarted(){
    if (ss_bSiteResponded == true) {
        help.value = "Beginning the data transfer using sendspace.com...";
        return;
    }

    function pb_checkStarted(){
    if (pb_bSiteResponded == true) {
        help.value = "Beginning the data transfer using pipebytes.com...";
        return;
    }
    
    function jb_checkStarted(){
    if (jb_bSiteResponded == true){
        help.value = "Beginning the data transfer using jetbytes.com...";
        return;
    }


Run: "python tlsnotary-test.py name_of_website_list_file"

where name_of_website_list_file has the same format as the examples websitelist.txt.

Format is : url , whitespace, comma separated list of allowable cipher suites.

Cipher suites are encoded as an integer as specified at the top of the script:

    #for reference (this is what is in the testing add-on)
    tlsnCipherSuiteNames=["security.ssl3.rsa_aes_128_sha","security.ssl3.rsa_aes_256_sha",\
    "security.ssl3.rsa_rc4_128_md5","security.ssl3.rsa_rc4_128_sha"]

Successful test run will be indicated in the stdout of the tlsnotary-test script.

In order to run the auditor in an automated fashion, you may need to add a button click automation in auditor.html
