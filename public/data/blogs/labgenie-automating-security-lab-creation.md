Last week I was watching the Critical Thinking podcast where **Rez0 and Gr3pme** talked about something called **CVE-GENIE**, a whitepaper that caught my attention. You can watch the episode here: 

[![Critical Thinking Podcast](https://img.youtube.com/vi/l6O_ez2CTOo/0.jpg)](https://www.youtube.com/embed/l6O_ez2CTOo)

I decided to dig deeper and read the paper: [**From CVE Entries to Verifiable Exploits**](https://arxiv.org/pdf/2509.01835). Shoutout to the researchers at **UC Santa Barbara** who created it—it's a wonderful multi-agent framework that generates **POC** code from **CVE** entries. I was amazed after reading through their approach.

That's when I got an idea to build something similar, but focused on a different problem. **LabGenie** isn't as complex as **CVE-GENIE**, but it tackles a related challenge that I've personally experienced.

---

## The Problem

As someone who's spent time in the **security research** space, I've noticed a recurring pattern. **Vulnerability write-ups** are everywhere blog posts, **GitHub** repos, security advisories. They describe fascinating bugs, clever exploitation techniques, and detailed attack chains. But here's the catch: very few of them come with a working lab environment you can actually test against.

Don't get me wrong,we have a huge ecosystem for learning generic vulnerabilities. **PortSwigger's Web Security Academy**, **HackTheBox**, and similar platforms offer excellent labs for practicing common security issues. These are fantastic for building foundational skills.


But what happens when you read about a specific vulnerability in a real application? Maybe it's a unique **authentication bypass** in a popular **CMS**, or a chained exploit involving multiple weaknesses. You want to understand how it works in that specific context, not just the generic vulnerability class. That's where the gap exists,we don't have a good solution for practicing specific vulnerabilities based on real-world write-ups.

If you want to understand a vulnerability deeply or practice exploiting it in its actual context, you're left with a tedious manual process. You need to set up the vulnerable application, configure the right versions, create docker containers, write test scripts, and somehow replicate the exact conditions described in the write-up. This can take hours or even days, and by the time you're done setting things up, you've lost the momentum to actually learn from the vulnerability.

I built LabGenie to solve this problem.

## What is LabGenie?

LabGenie is a terminal-first CLI tool that transforms vulnerability write-ups into fully functional, runnable security labs. You give it a URL to a vulnerability write-up, and it generates everything you need for your vulnerable application.
The entire process is automated through a four-stage AI agent pipeline. Each agent specializes in a different part of the transformation, from parsing the write-up to building the final lab environment.

## The Architecture

At its core, LabGenie uses a multi-agent workflow powered by Google's Gemini models. I chose this approach because vulnerability write-ups vary significantly in their structure and detail. Some are concise GitHub advisories, others are detailed blog posts with code snippets and screenshots. A single AI model would struggle to handle this variety, so I broke the problem into four distinct stages.

![Lab Genie WorkFlow](/images/flowchart.png)

### Stage 1: Content Extraction (WriteUpToMarkdown)

The WriteUpToMarkdown agent fetches and validates the content. It pulls the write-up through **Jina.ai's reader API**, which converts any webpage to clean markdown. The agent then validates whether the content is actually about a security vulnerability and not just a random blog post. This stage is **intentionally fast and lightweight**. So we use lightweight model like **gemini-2.5-flash** for this purpose.

### Stage 2: Vulnerability Parsing (WriteupParser)

Once we have the markdown content, the WriteupParser agent takes over. It reads through the entire write-up and extracts structured data: the vulnerability type, affected software versions, CVE identifiers, attack vectors, and the technical details of how the exploit works.

It **understands the narrative** of the write-up and extracts implicit information. For example, if a write‑up states "sending a request to the xyz endpoint allows a user to escalate privileges to admin," the agent will infer that the vulnerability is a privilege escalation related to the xyz endpoint.

### Stage 3: Lab Planning (LabCorePlanner)

With structured vulnerability data in hand, the LabCorePlanner agent designs the complete lab architecture. This is probably the **most complex stage**. The agent needs to figure out what kind of application would best demonstrate the vulnerability, what the database schema should look like.

### Stage 4: Lab Building (LabBuilder)

The final LabBuilder agent takes the plan and generates all the actual files. This includes application source code, Dockerfile and docker-compose configurations, database initialization scripts, and documentation.

### Why Gemini?

I went with Google's Gemini models for a few practical reasons. First, the **Gemini API is free to use**, which means anybody can try out LabGenie without worrying about API costs. This was important to me because I wanted the tool to be accessible to anyone curious about security.

Second, **Gemini 2.5 Flash and 2.5 Pro give excellent responses** for this kind of task. The Flash model is fast and efficient for content validation, while Pro handles the complex reasoning needed for parsing vulnerabilities and generating code. The **2.5 Pro model also has a massive context window**, which is crucial when you're generating complete applications.
That said, LabGenie is not tied to a single provider. Users can also change to **Vertex AI** as the provider via the `.env` file, making it easy to switch between different providers.
I did experiment with other models too other than Gemini. **GPT-5 is also great at this task** and produces high-quality results. But for now, I'm sticking with Gemini as the default because of the free tier and straightforward API. 

### Multi-Agent vs Single Agent

I experimented with using a single large model to do everything, but the results were inconsistent. By **breaking the problem into stages**, each agent can focus on doing one thing really well. The parsing agent doesn't need to worry about code generation, and the building agent doesn't need to validate URLs.

This also makes the system **more maintainable**. If I want to improve how labs are planned, I only need to modify the LabCorePlanner agent and its prompt without touching the other stages.


## What Gets Generated

When LabGenie finishes running, you get a **complete lab directory** with everything you need:

\`\`\`
output/sql-injection-lab/
├── lab_manifest.json      # Metadata about the lab
├── README.md              # Setup and usage instructions
├── REPRO.md               # Step-by-step reproduction guide
├── Dockerfile             # Single container setup
└── src/                   # Vulnerable application code
\`\`\`

LabGenie is smart about container orchestration. If the lab only needs a single container, it generates a simple Dockerfile. But if the vulnerability requires multiple services—say, a web application plus a separate database or a backend API—it creates a **docker-compose.yml file** instead to orchestrate everything properly.

You can literally run `docker build` and `docker run` for simple labs, or `docker-compose up` for multi-container setups, and have a **vulnerable environment running in seconds**. The README includes clear instructions on how to exploit the vulnerability, what to look for, and how to verify the exploit worked.
One of the main problems I faced was **rate limiting when using the Gemini API**. The free tier has strict request limits that could interrupt the lab generation process. This was fixed by switching to **Vertex AI as the provider**, which offers more generous rate limits and better reliability for production use.


## Real-World Testing

I've tested LabGenie with various types of vulnerability write-ups: SQL injection, XSS, deserialization bugs, authentication bypasses, and more. The quality of the generated labs is **surprisingly good**. They're not perfect—sometimes the exploit code needs minor tweaks or the application architecture could be more realistic—but they're **functional and ready to use**.

The biggest value is in **speed**. What used to take hours of manual setup now takes minutes. You can go from reading about a vulnerability to actually exploiting it in your own environment **almost instantly**.

## What's Next

There are several directions I want to take this project:

- Support for more AI providers like **Claude or GPT-4**
- A **web interface** for those who prefer GUI over terminal
- **Automated testing** to verify labs actually work
- **Custom lab templates** for specific vulnerability types

## Open Source

LabGenie is **open source**, and I'd love to see what others build with it. If you're interested in security research, education, or just want to understand vulnerabilities better, give it a try.
The code is structured to be **extensible**. Adding a new agent is straightforward—create a directory, write a prompt, inherit from the base agent class, and plug it into the workflow. The base agent handles all the complexity of multi-provider support, JSON generation, error handling, and logging.

## Final Thoughts

Building LabGenie has been an incredible learning experience. The biggest takeaway? AI agents don't need to be all-knowing superheroes. Give them one job, let them do it well, and watch them collaborate beautifully. It's like having a team of specialists instead of one burnt-out generalist.

I also want to give a huge shoutout to the researchers behind the whitepaper "[From CVE Entries to Verifiable Exploits](https://arxiv.org/pdf/2509.01835)". Their work was a massive inspiration for LabGenie, and this project wouldn't exist without their groundbreaking research.

If you're building something similar, hit me up! Better tools mean more people can learn, and that's a win for everyone.

---

**Repository**: [https://github.com/ff-sec-here/LabGenie](https://github.com/ff-sec-here/LabGenie)  
**Research Paper**: [From CVE Entries to Verifiable Exploits](https://arxiv.org/pdf/2509.01835)
