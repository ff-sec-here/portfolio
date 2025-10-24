# From Novice to Ninja: Unraveling Bug Bounty Beginnings through Cache Poisoning

Original: https://cametom006.medium.com/from-novice-to-ninja-unraveling-bug-bounty-beginnings-through-cache-poisoning-40de3f8fd211  
Author: Fahad Faisal • Date: 2024‑05‑10

This post reflects on my early bug bounty journey—how curiosity, community, and focused practice led to my first wins through web cache poisoning.

## The Beginning

During lockdown, I doubled down on learning Python/JavaScript, completing courses and grinding challenges on PortSwigger and Hack The Box. I also absorbed writeups and reports to internalize patterns.

A pivotal moment was discovering Youstin’s research on cache poisoning. Inspired, I built a small Python script to probe for related issues.

## First Bounties

I identified a cache poisoning issue involving `X-Forwarded-Scheme` on a private program and earned my first $500. Within days, more findings followed, and over the next weeks I scaled my approach.

I later automated checks based on patterns from Youstin’s post and uncovered an Akamai caching behavior related to invalid headers per RFC7230, leading to >$1.5k in payouts.

## Lessons Learned

- Start simple, automate thoughtfully.
- Stand on the shoulders of community research.
- Turn inspiration into tooling and repeatable methodology.
