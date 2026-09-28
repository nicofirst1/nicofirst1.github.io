---
layout: page
permalink: /rclone-privacy-policy/
title: Privacy Policy
description: Privacy policy for the rclone backup application.
noindex: true
sitemap: false
---

<style>
.pp-doc ul { list-style: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
.pp-doc ol { list-style: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
.pp-doc li { margin-bottom: 0.25rem; }
.pp-doc h2 { margin-top: 2rem; margin-bottom: 0.75rem; font-size: 1.5rem; font-weight: 600; }
</style>

<div class="pp-doc" markdown="1">

Last updated: 2026-09-28

This Privacy Policy explains how Nicolo Brandizzi ("we", "us", or "our") handles information in connection with this application and related services.

## Who We Are

This application is operated by Nicolo Brandizzi.

Contact: <a class="js-obf-email" data-e="YnJhbmRpbWF4MkBnbWFpbC5jb20=" href="#">[enable JavaScript to view email]</a>

## What This App Does

This application is [rclone](https://rclone.org), an open-source command-line program used to sync and copy files between local storage and cloud storage providers. In this instance, rclone is used solely to back up personal files between local storage and Google Drive. It accesses only the Google Drive API and does not access any other Google service or any other user's data.

## Information We Collect

We may collect and process:

- OAuth access and refresh tokens issued by Google to authorize access to Google Drive
- Metadata about files stored in Google Drive (names, sizes, folder structure, modification times) needed to perform backup operations
- File contents transferred between the authorized Google Drive account and local backup storage, only as needed to complete a backup

## How We Use Information

We use information only to:

- authenticate with the Google Drive API
- perform the requested backup and sync operations
- operate and maintain the service
- diagnose failures and improve reliability

## Data Sharing

We do not sell personal data.

We do not share data with third parties except:

- when required to operate the service through the Google Drive API
- when required by law
- when necessary to protect the security or integrity of the service

rclone's use and transfer of information received from Google APIs adheres to the [Google API Services User Data Policy](https://developers.google.com/terms/api-services-user-data-policy), including the Limited Use requirements.

## Data Retention

We keep data only for as long as needed to operate the backup service and support troubleshooting. Access can be revoked at any time (see "User Control" below), after which no further data is accessed.

## Security

We take reasonable steps to protect stored data and credentials. However, no method of transmission or storage is completely secure.

## User Control

Users may revoke this app's access to Google Drive at any time via [Google Account permissions](https://myaccount.google.com/permissions) or by contacting us.

## Children's Privacy

This service is not directed to children.

## Changes To This Policy

We may update this Privacy Policy from time to time. The latest version will always be posted at this URL.

## Contact

If you have questions about this Privacy Policy, contact:

Nicolo Brandizzi  
<a class="js-obf-email" data-e="YnJhbmRpbWF4MkBnbWFpbC5jb20=" href="#">[enable JavaScript to view email]</a>

</div>

<script>
(function(){
  var els = document.querySelectorAll('.js-obf-email');
  for (var i = 0; i < els.length; i++) {
    try {
      var addr = atob(els[i].getAttribute('data-e'));
      els[i].href = 'mailto:' + addr;
      els[i].textContent = addr;
      els[i].removeAttribute('data-e');
    } catch(e) {}
  }
})();
</script>
