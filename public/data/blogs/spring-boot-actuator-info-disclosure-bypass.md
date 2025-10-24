# How I Found and Bypassed a Spring Boot Actuator Information Disclosure Bug

Greetings, community! Today, I want to share the fascinating journey of how I discovered an information disclosure bug in a **Spring Boot Actuator** while hunting on a bug bounty program on the **Inspectiv** platform, and the steps I took to **bypass** it.

![Discovery GIF](/images/discovery.gif)

## Methodology

First, I employed the **haktrails tool** to gather all the subdomains associated with the target. This tool, which you can find [here](https://github.com/hakluke/haktrails), is particularly effective in enumerating subdomains by leveraging the securitytails API.

Once I had a comprehensive list of subdomains, I filtered out the live ones using **httpx**. With the active subdomains identified, I proceeded to the fuzzing phase. For this, I utilized a custom directory fuzzing wordlist tailored to the specifics of the target.

## The Spring Boot Actuator Gold Mine

![Gold Mine GIF](/images/goldmine.gif)

After analyzing the fuzzing results, I discovered a subdomain had an exposed `/actuator` directory. This directory revealed all the available Actuator endpoints, which I decided to investigate further based on the responses received from the `/actuator` endpoint.

- **/dump**: Displayed a clutter of threads, including stack traces.
- **/trace**: Showed the last several HTTP messages, potentially including session identifiers.
- **/logfile**: Output the contents of the log file.
- **/shutdown**: Allowed for the shutdown of the application.
- **/mappings**: Displayed all the MVC controller mappings.
- **/env**: Provided access to the configuration environment.
- **/restart**: Restarted the application.

**The following Actuator endpoints were particularly noteworthy:**

- **/env**: Provided access to the configuration environment. While the credentials were redacted, some internal data was still exposed.
- **/metrics/http.client.requests**: Exposed email addresses of customers and SQL statements used internally.

![Actuator Endpoints](/images/actuator-endpoints.png)

I decided to report the issue to the relevant team. They promptly triaged and rewarded me for the report, acknowledged the potential security risks, and took the necessary steps to mitigate them.

## Attempting to Bypass the Fix

A couple of months later, while reviewing old reports, I decided to recheck the subdomains to see if any other Actuator hosts were still active. Upon examining the fuzzing results, I discovered that one host's IP address still had an exposed `/actuator` endpoint. However, when attempting to access it, I encountered a **401 Unauthorized response**. This indicated that the team had implemented a fix, likely using **firewall** rules, to restrict unauthorized access to sensitive Actuator endpoints.

With my curiosity at its peak, I turned to a **tool 4-ZERO-3**, available at [https://github.com/Dheerajmadhukar/4-ZERO-3](https://github.com/Dheerajmadhukar/4-ZERO-3), which contains various techniques to bypass 403/401 restrictions. I'd like to give a shout-out to the author of this tool for their valuable contribution.

![Bypass Tool](/images/bypass-tool.png)

After the results came out from this tool, I discovered that the firewall rules could be bypassed by manipulating the Actuator URL. Specifically, appending a semicolon (;) followed by additional endpoints, such as `/env`, to the Actuator URL allowed me to access otherwise restricted information. For instance, accessing `https://test.com/actuator;/env` successfully bypassed the firewall restrictions and provided access to sensitive data.

After reporting the issue, the team promptly addressed the vulnerability. As a precautionary measure, they temporarily excluded the exposed Actuator endpoints from the program policy while actively working on implementing a robust fix.

**I extend my sincere thanks to @GodfatherOrwa for providing me with valuable insights and tips that helped me in finding this issue.**

![Success GIF](/images/success-celebration.gif)

This experience underscores the crucial need for regular monitoring of our digital assets. By harnessing shared expertise and effective tools, we fortify our defenses and protect sensitive data from emerging threats.

**Thank you for reading my story. Stay tuned for more insights in my next blog post!**
