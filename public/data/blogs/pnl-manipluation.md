While conducting security research on cryptocurrency trading platforms, I stumbled upon a fascinating vulnerability that challenged everything I thought I knew about client-side security controls. What started as routine testing turned into a complex investigation of trust boundaries, data integrity, and the subtle ways attackers can exploit the gap between client and server validation.

**NOTE:** Although the BB report for this vulnerability was rewarded as low severity, I felt compelled to share my experience because of the joy I had in uncovering the issue. The thrill of learning something entirely new, and the countless debugging sessions that made the process so engaging. It wasn't just about the bounty — it was about the journey of diving deep into the platform's mechanics, piecing together clues, and finally seeing the exploit in action. This discovery marked a whole new experience for me, both as a bug bounty hunter and as a learner.

## The Discovery

The target? A popular trading platform that had implemented what appeared to be robust anti-tampering measures. The result? A complete bypass that allowed me to create fake million-dollar portfolios and host them on the official domain with legitimate sharing IDs.

## The Platform's Defense Mechanisms

The platform I was testing had clearly learned from common attack patterns. Traditional approaches like intercepting requests with Burp Suite or modifying POST data to generate a PNL through the PNL generation endpoint were met with immediate rejection:

\`\`\`json
{
  "success": false,
  "code": -1000,
  "message": "An internal error has occurred. We are unable to process your request. Please try again later."
}
\`\`\`

## Understanding the Data Flow

I first needed to understand exactly how the platform generated Profit and Loss (PnL) reports. Here's what I discovered:

### Step 1: Balance Retrieval

The client fetches portfolio data from:
\`\`\`
https://gateway.tradehub.finance/user/wallet-summary
\`\`\`

This returns comprehensive balance information:

\`\`\`json
{
  "success": true,
  "data": {
    "balances": [
      {
        "token": "AAVE",
        "holding": 0.000080
      }
    ]
  }
}
\`\`\`

### Step 2: Client-Side Processing

The platform processes this data in the browser, calculating PnL values, formatting displays, and preparing sharing requests.

### Step 3: Share Request Generation

When a user clicks "Share," the platform sends processed data to:

\`\`\`http
POST /analytics/share-performance HTTP/2
Host: gateway.tradehub.finance
Content-Type: application/json

{
  "symbol": "BTC/USDT",
  "leverage": "10",
  "side": "1",
  "profitability": -0.08231948572754343,
  "pnl": "-0.01",
  "average_price": "59,645.67",
  "mark_price": "59,596.57",
  "quantity": "0.00009076",
  "encode": "3357cbc992bea7d379aea186a15b7fa8ac267b28db10927c2e1dd5f0d996e887",
  "qr_code": "https://tradehub.finance/register?ref=G49FFEQC",
  "share_time": "2024-08-18 12:25:38"
}
\`\`\`

The key insight here was the `encode` parameter—clearly a hash designed to prevent tampering.

## The Breakthrough: The HMAC Challenge

After hours of analysis, I discovered that this platform implemented something I hadn't seen before: response HMAC verification. This was a game-changer that made traditional attack methods completely ineffective.

The platform's security was far more sophisticated than I initially realized:

- Server sends data with HMAC signature
- Client validates HMAC before processing
- Client processes data only after HMAC verification
- Client generates integrity hash of processed data
- Server validates both HMAC and integrity hash

This meant that traditional Burp Suite techniques like Match and Replace were completely useless. If I modified the response using Burp Suite, the client-side HMAC verification would immediately fail, and the tampered data would be rejected before any processing could occur.

I spent hours trying to crack their HMAC implementation — analyzing the algorithm, attempting to reverse-engineer. The HMAC verification was so robust that any network-level tampering would be instantly detected.

But then I realized something crucial: what happens to the data AFTER successful HMAC verification?

The key insight was that I needed to manipulate the data during runtime, after the HMAC had been successfully verified but before the final integrity hash was generated.

## The Exploitation Technique: Post-HMAC Runtime Manipulation

Since traditional network-level tampering was impossible due to HMAC verification, I had to find a way to manipulate the data after it had been successfully validated but before the final sharing request was generated.

### The Critical Timing Window

The vulnerability existed in a very specific timing window:

1. Response received → HMAC verified
2. Data stored in memory → Available for manipulation
3. PnL calculations performed → Using manipulated data
4. Share request generated → With integrity hash of manipulated data

### Phase 1: Setting Up the Runtime Intercept

I opened the browser's developer tools and navigated to the Sources tab. In the main JavaScript bundle, I searched for the fetch operation:

\`\`\`javascript
const T = (await fetch(p, {
  method: n,
  headers: f,
  body: b,
  credentials: d
})).json();
return J1(await T, r == null ? void 0 : r.omitCodes),
\`\`\`

### Phase 2: The Conditional Breakpoint

I set a conditional breakpoint on the fetch line with a specific condition:

\`\`\`javascript
p === "https://gateway.tradehub.finance/user/wallet-summary"
\`\`\`

This ensured the breakpoint would only trigger for the wallet summary API call, not other requests.

### Phase 3: Post-HMAC Data Manipulation

Here's where the real breakthrough happened. When the breakpoint triggered, the HMAC verification passed and the data was stored in browser memory, I could manipulate it during runtime:

**Original Response:**
\`\`\`json
{
  "token": "AAVE",
  "holding": 0.000080,
  "market_price": 136.605
}
\`\`\`

**Modified Response:**
\`\`\`json
{
  "token": "AAVE",
  "holding": 100.000080, // Inflated by 1,250,000%
  "market_price": 136.605
}
\`\`\`

I modified the `holding` parameter from 0.000080 to 100.000080—increasing my AAVE holdings by over a million percent.

![Runtime manipulation pic](/images/runtime-manipulation.png )

### Phase 4: The QR Code Injection

The QR code manipulation had to be done during the share request generation, since this parameter wasn't protected by the response HMAC. When the share request was being prepared, I could modify:

\`\`\`json
"qr_code": "https://malicious-phishing-site.com/steal-credentials"
\`\`\`

### Phase 5: Generating the Fraudulent PnL

I resumed script execution, and the platform dutifully calculated my "new" PnL based on the manipulated data. When I clicked "Share," the platform generated a legitimate sharing ID with my inflated portfolio.

## The Result: A Perfect Deception

The attack was successful. I had created a PnL image showing massive profits hosted on the official domain with a legitimate sharing ID. To any observer, this would appear to be a genuine trading success story.

Even more concerning, the QR code on the image now pointed to a malicious site, ready to harvest credentials from unsuspecting users who scanned it.

## Real-World Impact Scenarios

This vulnerability opens the door to several serious attack scenarios:

### Reputation Manipulation

Social media influence in crypto is valuable. Attackers could:
- Build false trading reputations
- Attract followers with fake success stories
- Monetize their fabricated expertise

### Sophisticated Phishing

The QR code manipulation enables:
- Credential harvesting through fake login pages
- Crypto wallet draining attacks
- Malware distribution to mobile devices

### Financial Fraud

Perhaps most dangerously, attackers could:
- Influence trading decisions with fake success stories
- Promote fraudulent investment schemes
- Cause financial losses to followers

## The Post-Validation Attack Vector

The platform made a sophisticated mistake: while they implemented excellent HMAC verification for network-level protection, they trusted the data once it passed validation. The gap existed between successful HMAC verification and final integrity hash generation.

## Conclusion

Although the report for this vulnerability was ultimately rewarded as low severity, I'm sharing it because the experience was far more valuable than the bounty itself. The platform had clearly invested significant effort into preventing traditional attack vectors, yet it overlooked a subtle runtime manipulation path. This was a reminder that as trading platforms evolve and introduce new features, security must evolve in parallel. It's not enough to ask, "How will users use this feature?" — we must also ask, "How could an attacker abuse it?" That mindset shift, coupled with the thrill of learning something new and the late-night debugging sessions, made this a truly transformative experience for me as a researcher.

All research was conducted ethically through authorized bug bounty programs. No real users were harmed in the discovery of this vulnerability.
