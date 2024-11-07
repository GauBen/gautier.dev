---
title: Using images to track third-party logins
description: A simple trick to know if a user is logged in to a third-party website.
snippet:
  lang: html
  code: |
    <img
      src="https://example.com/login?next=/favicon.ico"
      onload="alert('Logged in')"
      onerror="alert('Logged out')"
    />
---

<script>
  import Mermaid from '$lib/Mermaid.svelte';
  import Tldr from '$lib/Tldr.svelte';
  import Tracker from './Tracker.svelte';

  let src = 'https://accounts.google.com/ServiceLogin?passive=true&continue=https://google.com/favicon.ico'
</script>

<Tldr>
This is a simple (and old) trick to know if a user is logged in to a third-party website. I read about it a long ago, but I can't find the original article. If you know it, please let me know!
</Tldr>

## Demo

Here is a list of websites that I can know if you are logged in or not:

<ul>
  <li>Google: <Tracker name="Google" src="https://accounts.google.com/ServiceLogin?passive=true&continue=https://google.com/favicon.ico" /></li>
  <li>LinkedIn: <Tracker name="LinkedIn" src="https://www.linkedin.com/authwall?sessionRedirect=/favicon.ico" /></li>
</ul>

It might not work if you have enhanced tracking protection enabled in your browser.

## How does it work?

Many websites use an "authwall" for logged out users who try to access a private page, with a `?redirect_to` (or similar) parameter to keep track of said page to redirect to it after login. If the user is already logged in, the authwall will be skipped and the user will be redirected to the page directly.

Some vulnerable websites allow arbitrary URLs, and **it can be exploited to know if the user is logged in** to the third-party website. They usually follow this very naive implementation:

<Mermaid>
  flowchart TD
    Start(User opens example.com/login?next=/favicon.ico)
    LoggedIn(Redirect to /favicon.ico)
    LoggedOut(Show a login form)
    Start -->|"The user is logged in"| LoggedIn
    Start -->|"The user is logged out"| LoggedOut
</Mermaid>

The real trick is to use `<img />`: if the image loads fine, the user is logged in, otherwise the user is logged out.

This cannot work with `fetch` or `XMLHttpRequest` because of [Cross-Origin Resource Sharing (CORS) security mechanisms](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#what_requests_use_cors), but `<img />` is not subject to them.

The implementation is very simple:

```html
<img
  src="https://example.com/login?next=/favicon.ico"
  onload="alert('Logged in')"
  onerror="alert('Logged out')"
/>
```

It can also be written like this in JavaScript:

```js
const img = new Image();
img.onload = () => alert("Logged in");
img.onerror = () => alert("Logged out");
img.src = "https://example.com/login?next=/favicon.ico";
```

The URLs used in the demo are:

- Google: `https://accounts.google.com/ServiceLogin?passive=true&continue=https://google.com/favicon.ico`
- LinkedIn: `https://www.linkedin.com/authwall?sessionRedirect=/favicon.ico`

## How to protect against it?

It turns out that being vulnerable to this attack is quite hard, since modern browsers have many security mechanisms to prevent it.

The demo above might not have worked for you because you have privacy features enabled in your browser.

If you develop a website with authentication, here's what you can do to protect your users:

- Use [`SameSite=Strict` or `Lax`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie#samesitesamesite-value) on your session cookies (like Github)
- Only use client-side redirects (like Reddit and Discord)
- Place the authwall on the restricted page, do not redirect to it (like Twitch)
- Always show the login page, even if the user is logged in (like Twitter)
- Do not allow arbitrary post-login pages (like Notion and Wikipedia)
- Look for a [`Sec-Fetch-Site: cross-site`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Sec-Fetch-Site) header to know if the request comes from another website (like Facebook)
- Always redirect users to the homepage (like dev.to)

I tried a lot of websites to lengthen the demonstration, but I found instead an impressively diverse set of security mechanisms. I'm not even mad, that's amazing.

## Try it yourself

Tinker to see if you can find a vulnerable website:

<p>
<label><input bind:value={src} style="width:100%" />
<Tracker {src} /></label>
</p>

If you find one, please let me know in the comments below!
