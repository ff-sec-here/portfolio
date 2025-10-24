I dived into the exciting world of bug bounty hunting, and I couldn't have made it this far without the incredible support of the bug bounty community. As I begin sharing my experiences, I want to extend my heartfelt thanks to everyone who has been a part of this journey with me.

This write-up is my way of expressing my appreciation for their guidance as I take my first steps into sharing my bug bounty experiences. There's so much more to come, and I'm grateful for the support that has brought me to this point.


## Discovering My Passion

At just 15 years old, my fascination with hacking ignited a journey of exploration. Initially inspired by YouTube hacking videos, my understanding of hacking was simplistic — a mere click of a button to hack entire computer systems.

Driven by curiosity, I delved into practical experiments. My journey commenced with Instagram phishing attempts and playful pranks on friends using tools like TBomb. Using Metasploit to get reverse shell on my friend's phone. Grabbing camera pics using CamPhish, etc…

These initial endeavors laid the foundation for my bug bounty journey. While my early exploits were lighthearted, they instilled in me a passion for understanding the intricacies of cybersecurity and the potential for ethical hacking.

## The Beginning of Beginning

The turning point in my hacking journey coincided with the onset of the COVID-19 pandemic. As schools shut down to curb the spread of the virus, I found myself spending a significant amount of time confined to my house. It was during this period of isolation that I decided to delve deep into the world of bug bounty hunting. With ample time on my hands, I threw myself into learning Python and JavaScript, immersing myself in online courses on platforms like Scrimba. Additionally, I tapped into local channels, seeking guidance and mentorship.

Throughout this time, I spent hours tackling challenges on PortSwigger and Hack The Box. I also read through more than ten reports on HackerOne to learn from others' experiences.

**After more than a month, I was mind blown after seeing this on HackerOne.**

![HackerOne Report](/images/hackerone-report.png)

I stumbled upon a report about Web Cache Poisoning by [Youstin](https://youst.in/) on HackerOne's activity feed. He wrote a great blog post about it too.

![Youstin Blog](/images/youstin-blog.png)

After studying it carefully, I decided to make a simple Python script to check for similar issues out there.

This is some code blocks of my simple python code:

![Python Code 1](/images/python-code-1.png)

**I found the X-Forwarded-Scheme - Rack Middleware cache poisoning issue on a private bug bounty program and earned my first payout of $500. This was my first internet money. Then, within two days, I received another $300. The following week, I got another $250.**

I was really amazed by my success, and it gave me a lot of confidence to keep searching for bugs. I decided to automate the process of finding cache issues from Youstin's blog. It turned out to be a smart move because I found an Akamai cache poisoning issue [(Caching an invalid 400 response by sending an invalid header defined in the RFC7230 like /)](https://youst.in/posts/cache-poisoning-at-scale/) and that made over $1500 from it in just three weeks.

Code Blocks of Akamai Cache Poisoning script:

![Python Code 2](/images/python-code-2.png)

**After a month, I earned over $6k from cache poisoning bugs. Soon after, the Ruby on Rails and Akamai teams fixed the issues, resolving all the problems highlighted in Youstin's blog. Thankfully, I acted wisely and earned my start before the fixes were implemented.**

## Changing the Mind

This inspired me to research caching servers further. As a result, I uncovered more issues with caching servers and successfully got bugs in the caching servers of companies like Apple and Dell.

On Dell's platform, I discovered an issue where the server was caching the "**400 Bad Request**" response when two "**Referrer**" headers were sent. With Apple, the problem was related to a custom configuration issue within their system.

![Dell Cache Issue](/images/dell-cache-issue.png)

At **Apple**, the issue was the "**X-Amz-Server-Side-Encryption**" header. This header, used to request server-side encryption for the response, triggered a "400 Bad Request" response if the server wasn't configured to support server-side encryption.

![Apple Cache Issue](/images/apple-cache-issue.png)

After that, my friend [Alex](https://twitter.com/Al7eX91) and I conducted research on caching servers and identified several potential attack vectors. This research enabled us to develop additional automation scripts to enhance our bug hunting capabilities. Even today, I continue to uncover various cache issues in different technologies in the wild.

I'd like to extend a special thanks to Youstin for sharing their insightful write-up, which sparked my journey into bug hunting.

And there you have it, the story of how I uncovered my first bug on a bug bounty platform! I hope you found it insightful and enjoyable. Keep an eye out for more of my adventures in the world of hacking — **I'll be sharing more stories and tips with you soon!**
